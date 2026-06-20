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
        Schema::table('usuarios', function (Blueprint $table) {
            if (!Schema::hasColumn('usuarios', 'password')) {
                $table->string('password')->nullable();
            }
            if (!Schema::hasColumn('usuarios', 'remember_token')) {
                $table->string('remember_token', 100)->nullable();
            }
            if (!Schema::hasColumn('usuarios', 'is_admin')) {
                $table->boolean('is_admin')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            if (Schema::hasColumn('usuarios', 'password')) {
                $table->dropColumn('password');
            }
            if (Schema::hasColumn('usuarios', 'remember_token')) {
                $table->dropColumn('remember_token');
            }
            if (Schema::hasColumn('usuarios', 'is_admin')) {
                $table->dropColumn('is_admin');
            }
        });
    }
};
