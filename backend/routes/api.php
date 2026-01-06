<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Project;
use App\Models\ProjectDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

// Login endpoint - Admin only
Route::post('/login', function (Request $request) {
    try {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Check if password is correct
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Check if user is admin or superadmin
        if (!in_array($user->role, ['admin', 'superadmin', 'client'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied. Only admin accounts can login.'
            ], 403);
        }

        // Start session and authenticate user
        // The session middleware is already applied globally, so session is available
        Auth::login($user, $request->boolean('remember'));
        
        // Regenerate session ID for security (prevents session fixation attacks)
        $request->session()->regenerate();
        
        // Ensure session is saved
        $request->session()->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
            ]
        ]);
    } catch (ValidationException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'An error occurred during login',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
});

// Register endpoint
Route::post('/register', function (Request $request) {
    try {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,employee,client',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
        ]);

        // Check if email already exists
        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email already registered'
            ], 422);
        }

        // Handle avatar upload
        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $avatarName = time() . '_' . uniqid() . '.' . $avatar->getClientOriginalExtension();
            $storedPath = $avatar->storeAs('avatars', $avatarName, 'public');
            // Get the base URL from the request
            $baseUrl = $request->getSchemeAndHttpHost();
            // Construct the URL: /storage/avatars/filename.jpg
            $relativePath = '/storage/' . $storedPath;
            $avatarPath = $baseUrl . $relativePath;
        }

        // Create new user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'avatar' => $avatarPath,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Account created successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
            ]
        ], 201);
    } catch (ValidationException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'An error occurred during registration',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
});

// Logout endpoint
Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return response()->json([
        'status' => 'success',
        'message' => 'Logged out successfully'
    ]);
});

// Check authenticated user
Route::get('/user', function (Request $request) {
    if (Auth::check()) {
        $user = Auth::user();
        return response()->json([
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
            ]
        ]);
    }

    return response()->json([
        'status' => 'error',
        'message' => 'Not authenticated'
    ], 401);
})->middleware('auth');

// Update user profile
Route::post('/user/update', function (Request $request) {
    try {
        // The auth middleware ensures user is authenticated
        $user = Auth::user();

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|nullable|string|min:8',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
        ]);

        // Update name if provided
        if ($request->has('name')) {
            $user->name = $request->name;
        }

        // Update email if provided
        if ($request->has('email')) {
            $user->email = $request->email;
        }

        // Update password if provided
        if ($request->has('password') && $request->password) {
            $user->password = Hash::make($request->password);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $avatarName = time() . '_' . uniqid() . '.' . $avatar->getClientOriginalExtension();
            $storedPath = $avatar->storeAs('avatars', $avatarName, 'public');
            // Get the base URL from the request
            $baseUrl = $request->getSchemeAndHttpHost();
            // Construct the URL: /storage/avatars/filename.jpg
            $relativePath = '/storage/' . $storedPath;
            $user->avatar = $baseUrl . $relativePath;
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
            ]
        ]);
    } catch (ValidationException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'An error occurred while updating profile',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
})->middleware('auth');

// Employee Management Routes (Admin Only)
Route::middleware('auth')->group(function () {
    // Check if user is admin
    $checkAdmin = function (Request $request) {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'superadmin'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }
        return null;
    };

    // Get all employees
    Route::get('/employees', function (Request $request) use ($checkAdmin) {
        $result = $checkAdmin($request);
        if ($result) return $result;

        try {
            $employees = Employee::with('creator')->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'status' => 'success',
                'employees' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching employees',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    });

    // Get single employee
    Route::get('/employees/{id}', function (Request $request, $id) use ($checkAdmin) {
        $result = $checkAdmin($request);
        if ($result) return $result;

        try {
            $employee = Employee::with('creator')->find($id);
            
            if (!$employee) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Employee not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'employee' => $employee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching employee',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    });

    // Create employee
    Route::post('/employees', function (Request $request) use ($checkAdmin) {
        $result = $checkAdmin($request);
        if ($result) return $result;

        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'date_of_birth' => 'required|date',
                'gender' => 'required|in:Male,Female',
                'email' => 'required|email|unique:employees,email',
                'password' => 'required|string|min:8',
                'address' => 'required|string',
                'branch_id' => 'nullable|string',
                'department' => 'nullable|string',
                'designation' => 'nullable|string',
                'date_of_joining' => 'nullable|date',
                'account_holder_name' => 'nullable|string',
                'account_number' => 'nullable|string',
                'bank_name' => 'nullable|string',
                'bank_identifier_code' => 'nullable|string',
                'branch_location' => 'nullable|string',
                'tax_payer_id' => 'nullable|string',
                'document' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // 10MB max
            ]);

            // Generate employee ID
            $employeeId = Employee::generateEmployeeId();

            // Handle document upload
            $documentPath = null;
            if ($request->hasFile('document')) {
                $document = $request->file('document');
                $documentName = time() . '_' . uniqid() . '.' . $document->getClientOriginalExtension();
                $storedPath = $document->storeAs('employee_documents', $documentName, 'public');
                $baseUrl = $request->getSchemeAndHttpHost();
                $relativePath = '/storage/' . $storedPath;
                $documentPath = $baseUrl . $relativePath;
            }

            // Create employee
            $employee = Employee::create([
                'employee_id' => $employeeId,
                'name' => $request->name,
                'phone' => $request->phone,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'address' => $request->address,
                'branch_id' => $request->branch_id,
                'department' => $request->department,
                'designation' => $request->designation,
                'date_of_joining' => $request->date_of_joining,
                'account_holder_name' => $request->account_holder_name,
                'account_number' => $request->account_number,
                'bank_name' => $request->bank_name,
                'bank_identifier_code' => $request->bank_identifier_code,
                'branch_location' => $request->branch_location,
                'tax_payer_id' => $request->tax_payer_id,
                'document' => $documentPath,
                'created_by' => Auth::id(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Employee created successfully',
                'employee' => $employee->load('creator')
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while creating employee',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    });

    // Update employee
    Route::put('/employees/{id}', function (Request $request, $id) use ($checkAdmin) {
        $result = $checkAdmin($request);
        if ($result) return $result;

        try {
            $employee = Employee::find($id);
            
            if (!$employee) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Employee not found'
                ], 404);
            }

            $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'phone' => 'sometimes|required|string|max:20',
                'date_of_birth' => 'sometimes|required|date',
                'gender' => 'sometimes|required|in:Male,Female',
                'email' => 'sometimes|required|email|unique:employees,email,' . $id,
                'password' => 'sometimes|nullable|string|min:8',
                'address' => 'sometimes|required|string',
                'branch_id' => 'nullable|string',
                'department' => 'nullable|string',
                'designation' => 'nullable|string',
                'date_of_joining' => 'nullable|date',
                'account_holder_name' => 'nullable|string',
                'account_number' => 'nullable|string',
                'bank_name' => 'nullable|string',
                'bank_identifier_code' => 'nullable|string',
                'branch_location' => 'nullable|string',
                'tax_payer_id' => 'nullable|string',
                'document' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            ]);

            // Update fields
            $employee->fill($request->only([
                'name', 'phone', 'date_of_birth', 'gender', 'email', 'address',
                'branch_id', 'department', 'designation', 'date_of_joining',
                'account_holder_name', 'account_number', 'bank_name',
                'bank_identifier_code', 'branch_location', 'tax_payer_id'
            ]));

            // Update password if provided
            if ($request->has('password') && $request->password) {
                $employee->password = Hash::make($request->password);
            }

            // Handle document upload
            if ($request->hasFile('document')) {
                $document = $request->file('document');
                $documentName = time() . '_' . uniqid() . '.' . $document->getClientOriginalExtension();
                $storedPath = $document->storeAs('employee_documents', $documentName, 'public');
                $baseUrl = $request->getSchemeAndHttpHost();
                $relativePath = '/storage/' . $storedPath;
                $employee->document = $baseUrl . $relativePath;
            }

            $employee->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Employee updated successfully',
                'employee' => $employee->load('creator')
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while updating employee',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    });

    // Delete employee
    Route::delete('/employees/{id}', function (Request $request, $id) use ($checkAdmin) {
        $result = $checkAdmin($request);
        if ($result) return $result;

        try {
            $employee = Employee::find($id);
            
            if (!$employee) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Employee not found'
                ], 404);
            }

            $employee->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Employee deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while deleting employee',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    });
});

// Project Management Routes
Route::middleware('auth')->group(function () {
    // Get all projects
    Route::get('/projects', function (Request $request) {
        try {
            $projects = Project::with(['creator', 'documents'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'status' => 'success',
                'projects' => $projects
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching projects',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    });

    // Get single project
    Route::get('/projects/{id}', function (Request $request, $id) {
        try {
            $project = Project::with(['creator', 'documents'])->find($id);
            
            if (!$project) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Project not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'project' => $project
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching project',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    });

    // Create project
    Route::post('/projects', function (Request $request) {
        try {
            $request->validate([
                'client_name' => 'required|string|max:255',
                'project_name' => 'required|string|max:255',
                'client_email' => 'required|email',
                'link' => 'nullable|url|max:500',
                'client_password' => 'required|string|min:6',
                'documents' => 'nullable|array',
                'documents.*' => 'file|mimes:pdf,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar,doc,docx,xls,xlsx|max:51200', // 50MB max per file
            ]);

            // Create project
            $project = Project::create([
                'client_name' => $request->client_name,
                'project_name' => $request->project_name,
                'client_email' => $request->client_email,
                'link' => $request->link,
                'client_password' => Hash::make($request->client_password),
                'created_by' => Auth::id(),
            ]);

            // Handle multiple document uploads
            if ($request->hasFile('documents')) {
                $baseUrl = $request->getSchemeAndHttpHost();
                
                foreach ($request->file('documents') as $file) {
                    $fileName = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
                    $storedPath = $file->storeAs('project_documents', $fileName, 'public');
                    $relativePath = '/storage/' . $storedPath;
                    $filePath = $baseUrl . $relativePath;

                    // Determine file type
                    $mimeType = $file->getMimeType();
                    $fileType = 'other';
                    if (str_starts_with($mimeType, 'image/')) {
                        $fileType = 'image';
                    } elseif (str_starts_with($mimeType, 'video/')) {
                        $fileType = 'video';
                    } elseif ($mimeType === 'application/pdf') {
                        $fileType = 'pdf';
                    } elseif (in_array($mimeType, ['application/zip', 'application/x-rar-compressed', 'application/x-zip-compressed'])) {
                        $fileType = 'zip';
                    } elseif (in_array($mimeType, ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])) {
                        $fileType = 'doc';
                    }

                    ProjectDocument::create([
                        'project_id' => $project->id,
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $filePath,
                        'file_type' => $fileType,
                        'mime_type' => $mimeType,
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Project created successfully',
                'project' => $project->load(['creator', 'documents'])
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while creating project',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    });

    // Update project
    Route::put('/projects/{id}', function (Request $request, $id) {
        try {
            $project = Project::find($id);
            
            if (!$project) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Project not found'
                ], 404);
            }

            $request->validate([
                'client_name' => 'sometimes|required|string|max:255',
                'project_name' => 'sometimes|required|string|max:255',
                'client_email' => 'sometimes|required|email',
                'link' => 'nullable|url|max:500',
                'client_password' => 'sometimes|nullable|string|min:6',
                'documents' => 'nullable|array',
                'documents.*' => 'file|mimes:pdf,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar,doc,docx,xls,xlsx|max:51200',
            ]);

            // Update fields
            $project->fill($request->only([
                'client_name', 'project_name', 'client_email', 'link'
            ]));

            // Update password if provided
            if ($request->has('client_password') && $request->client_password) {
                $project->client_password = Hash::make($request->client_password);
            }

            $project->save();

            // Handle additional document uploads
            if ($request->hasFile('documents')) {
                $baseUrl = $request->getSchemeAndHttpHost();
                
                foreach ($request->file('documents') as $file) {
                    $fileName = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
                    $storedPath = $file->storeAs('project_documents', $fileName, 'public');
                    $relativePath = '/storage/' . $storedPath;
                    $filePath = $baseUrl . $relativePath;

                    $mimeType = $file->getMimeType();
                    $fileType = 'other';
                    if (str_starts_with($mimeType, 'image/')) {
                        $fileType = 'image';
                    } elseif (str_starts_with($mimeType, 'video/')) {
                        $fileType = 'video';
                    } elseif ($mimeType === 'application/pdf') {
                        $fileType = 'pdf';
                    } elseif (in_array($mimeType, ['application/zip', 'application/x-rar-compressed', 'application/x-zip-compressed'])) {
                        $fileType = 'zip';
                    } elseif (in_array($mimeType, ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])) {
                        $fileType = 'doc';
                    }

                    ProjectDocument::create([
                        'project_id' => $project->id,
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $filePath,
                        'file_type' => $fileType,
                        'mime_type' => $mimeType,
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Project updated successfully',
                'project' => $project->load(['creator', 'documents'])
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while updating project',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    });

    // Delete project
    Route::delete('/projects/{id}', function (Request $request, $id) {
        try {
            $project = Project::find($id);
            
            if (!$project) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Project not found'
                ], 404);
            }

            // Delete associated documents from storage
            foreach ($project->documents as $document) {
                $relativePath = str_replace($request->getSchemeAndHttpHost(), '', $document->file_path);
                $storagePath = str_replace('/storage/', '', $relativePath);
                if (Storage::disk('public')->exists($storagePath)) {
                    Storage::disk('public')->delete($storagePath);
                }
            }

            $project->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Project deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while deleting project',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    });

    // Delete project document
    Route::delete('/projects/{projectId}/documents/{documentId}', function (Request $request, $projectId, $documentId) {
        try {
            $document = ProjectDocument::where('project_id', $projectId)->find($documentId);
            
            if (!$document) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Document not found'
                ], 404);
            }

            // Delete file from storage
            $relativePath = str_replace($request->getSchemeAndHttpHost(), '', $document->file_path);
            $storagePath = str_replace('/storage/', '', $relativePath);
            if (Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->delete($storagePath);
            }

            $document->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Document deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while deleting document',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    });
});


