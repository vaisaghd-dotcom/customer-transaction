<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pipedrive_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('access_token', 500);
            $table->string('refresh_token', 500)->nullable();
            $table->string('api_domain', 255);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pipedrive_tokens');
    }
};