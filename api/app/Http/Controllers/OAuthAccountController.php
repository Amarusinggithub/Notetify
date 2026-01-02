<?php

namespace App\Http\Controllers;

use App\Models\OAuthAccount;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOAuthAccountRequest;
use App\Http\Requests\UpdateOAuthAccountRequest;

class OAuthAccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOAuthAccountRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(OAuthAccount $oAuthAccount)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(OAuthAccount $oAuthAccount)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOAuthAccountRequest $request, OAuthAccount $oAuthAccount)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OAuthAccount $oAuthAccount)
    {
        //
    }
}
