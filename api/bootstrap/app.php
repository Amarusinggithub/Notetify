<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //  $middleware->alias([
        //    'auth.cookie' => \App\Http\Middleware\CookieAuthMiddleware::class,
        //]);
    })

    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();



$app->useEnvironmentPath(dirname($app->basePath()));

return $app;
