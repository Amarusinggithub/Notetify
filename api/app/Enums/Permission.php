<?php

namespace App\Enums;

enum Permission: string
{
    case View    = 'view';
    case Comment = 'comment';
    case Edit    = 'edit';
}
