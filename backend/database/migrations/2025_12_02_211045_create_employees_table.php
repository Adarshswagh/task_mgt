<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            
            // Employee ID (auto-generated like #DTG027)
            $table->string('employee_id')->unique();
            
            // Personal Details
            $table->string('name');
            $table->string('phone');
            $table->date('date_of_birth');
            $table->enum('gender', ['Male', 'Female']);
            $table->string('email')->unique();
            $table->string('password');
            $table->text('address');
            
            // Company Details
            $table->string('branch_id')->nullable();
            $table->string('department')->nullable();
            $table->string('designation')->nullable();
            $table->date('date_of_joining')->nullable();
            
            // Bank Account Details
            $table->string('account_holder_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_identifier_code')->nullable();
            $table->string('branch_location')->nullable();
            $table->string('tax_payer_id')->nullable();
            
            // Document (file path)
            $table->string('document')->nullable();
            
            // Created by (admin who created this employee)
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
