package com.expo.sales.exception;

public class AdminAuthenticationException extends RuntimeException {
    public AdminAuthenticationException() { super("Invalid admin password"); }
}
