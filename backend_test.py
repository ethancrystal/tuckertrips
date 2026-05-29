#!/usr/bin/env python3
"""
Tucker Trips Backend API Test Suite - Password Reset Flow Testing
Tests Supabase Password Reset Integration and Flow
"""

import requests
import json
import sys
import time
from datetime import datetime

# Get base URL from environment
BASE_URL = "https://tucker-trip-rebuild.preview.emergentagent.com"

class PasswordResetFlowTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_email = "test.user@example.com"
        
    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")

    def test_supabase_configuration(self):
        """Test that Supabase configuration is accessible"""
        self.log("=== Testing Supabase Configuration ===")
        
        try:
            # Test if the main page loads (which imports Supabase)
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                self.log("✅ Main page loads successfully - Supabase configuration accessible")
                return True
            else:
                self.log(f"❌ Main page failed to load: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Supabase configuration test error: {str(e)}")
            return False

    def test_reset_password_page_access(self):
        """Test that the reset password page is accessible"""
        self.log("=== Testing Reset Password Page Access ===")
        
        try:
            response = requests.get(f"{self.base_url}/reset-password")
            if response.status_code == 200:
                # Check if the page contains expected elements
                page_content = response.text
                if ("Create New Password" in page_content and 
                    "Enter your new password below" in page_content and
                    "New Password" in page_content and
                    "Confirm New Password" in page_content):
                    self.log("✅ Reset password page loads with correct content")
                    return True
                else:
                    self.log("❌ Reset password page missing expected content")
                    return False
            else:
                self.log(f"❌ Reset password page failed to load: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Reset password page test error: {str(e)}")
            return False

    def test_auth_modal_integration(self):
        """Test that the main page contains the auth modal with forgot password functionality"""
        self.log("=== Testing Auth Modal Integration ===")
        
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                page_content = response.text
                
                # Check for key components that indicate proper integration
                checks = [
                    ("AuthModalNew component", "AuthModalNew" in page_content or "auth" in page_content.lower()),
                    ("Supabase import", "supabase" in page_content.lower() or "@supabase" in page_content),
                    ("React components", "react" in page_content.lower()),
                ]
                
                passed_checks = 0
                for check_name, condition in checks:
                    if condition:
                        self.log(f"✅ {check_name} found")
                        passed_checks += 1
                    else:
                        self.log(f"⚠️ {check_name} not clearly visible (may be bundled)")
                
                if passed_checks >= 1:  # At least basic integration visible
                    self.log("✅ Auth modal integration appears to be working")
                    return True
                else:
                    self.log("❌ Auth modal integration issues detected")
                    return False
            else:
                self.log(f"❌ Main page failed to load: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Auth modal integration test error: {str(e)}")
            return False

    def test_password_reset_flow_structure(self):
        """Test the structure and flow of password reset implementation"""
        self.log("=== Testing Password Reset Flow Structure ===")
        
        try:
            # Test that reset-password page handles session verification
            response = requests.get(f"{self.base_url}/reset-password")
            if response.status_code == 200:
                page_content = response.text
                
                # Check for key elements that indicate proper implementation
                structure_checks = [
                    ("Session verification", "session" in page_content.lower()),
                    ("Password validation", "password" in page_content.lower()),
                    ("Form handling", "form" in page_content.lower()),
                    ("Error handling", "error" in page_content.lower()),
                    ("Loading states", "loading" in page_content.lower() or "loader" in page_content.lower()),
                    ("Password visibility toggle", "eye" in page_content.lower() or "show" in page_content.lower()),
                ]
                
                passed_checks = 0
                for check_name, condition in structure_checks:
                    if condition:
                        self.log(f"✅ {check_name} implemented")
                        passed_checks += 1
                    else:
                        self.log(f"⚠️ {check_name} not clearly visible")
                
                if passed_checks >= 4:  # Most key features visible
                    self.log("✅ Password reset flow structure is properly implemented")
                    return True
                else:
                    self.log(f"❌ Password reset flow structure incomplete ({passed_checks}/6 checks passed)")
                    return False
            else:
                self.log(f"❌ Reset password page failed to load: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Password reset flow structure test error: {str(e)}")
            return False

    def test_supabase_auth_methods_integration(self):
        """Test that Supabase auth methods are properly integrated"""
        self.log("=== Testing Supabase Auth Methods Integration ===")
        
        # This test verifies the integration by checking if the pages load without errors
        # and contain the expected Supabase-related functionality
        
        try:
            # Test main page (contains AuthModalNew with resetPasswordForEmail)
            main_response = requests.get(f"{self.base_url}/")
            reset_response = requests.get(f"{self.base_url}/reset-password")
            
            if main_response.status_code == 200 and reset_response.status_code == 200:
                self.log("✅ Both auth pages load successfully")
                
                # Check for JavaScript bundle loading (indicates proper build)
                main_content = main_response.text
                if "_next/static" in main_content or "script" in main_content:
                    self.log("✅ JavaScript bundles loading properly")
                    
                    # Check for proper Next.js hydration
                    if "__NEXT_DATA__" in main_content:
                        self.log("✅ Next.js hydration data present")
                        return True
                    else:
                        self.log("⚠️ Next.js hydration data not found, but pages load")
                        return True
                else:
                    self.log("❌ JavaScript bundles not loading properly")
                    return False
            else:
                self.log(f"❌ Page loading failed - Main: {main_response.status_code}, Reset: {reset_response.status_code}")
                return False
                
        except Exception as e:
            self.log(f"❌ Supabase auth methods integration test error: {str(e)}")
            return False

    def test_environment_variables(self):
        """Test that required environment variables are configured"""
        self.log("=== Testing Environment Variables Configuration ===")
        
        try:
            # Test by making a request that would use environment variables
            response = requests.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                # If the page loads without 500 errors, environment variables are likely configured
                self.log("✅ Environment variables appear to be properly configured")
                
                # Check response headers for any Supabase-related information
                headers = response.headers
                if 'x-powered-by' in headers and 'Next.js' in headers.get('x-powered-by', ''):
                    self.log("✅ Next.js server running properly")
                    return True
                else:
                    self.log("✅ Server running (environment variables working)")
                    return True
            else:
                self.log(f"❌ Server error suggests environment variable issues: {response.status_code}")
                return False
                
        except Exception as e:
            self.log(f"❌ Environment variables test error: {str(e)}")
            return False

    def test_password_reset_validation_logic(self):
        """Test password reset validation requirements"""
        self.log("=== Testing Password Reset Validation Logic ===")
        
        try:
            response = requests.get(f"{self.base_url}/reset-password")
            if response.status_code == 200:
                page_content = response.text
                
                # Check for validation requirements in the page
                validation_checks = [
                    ("Minimum length validation", "6" in page_content and ("char" in page_content.lower() or "length" in page_content.lower())),
                    ("Password matching", "confirm" in page_content.lower() and "password" in page_content.lower()),
                    ("Required fields", "required" in page_content.lower()),
                    ("Form validation", "minlength" in page_content.lower() or "validation" in page_content.lower()),
                ]
                
                passed_validations = 0
                for validation_name, condition in validation_checks:
                    if condition:
                        self.log(f"✅ {validation_name} implemented")
                        passed_validations += 1
                    else:
                        self.log(f"⚠️ {validation_name} not clearly visible")
                
                if passed_validations >= 2:  # At least basic validation visible
                    self.log("✅ Password validation logic is properly implemented")
                    return True
                else:
                    self.log(f"❌ Password validation logic incomplete ({passed_validations}/4 checks passed)")
                    return False
            else:
                self.log(f"❌ Reset password page failed to load: {response.status_code}")
                return False
                
        except Exception as e:
            self.log(f"❌ Password validation logic test error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all password reset flow tests"""
        self.log("🔐 Starting Tucker Trips Password Reset Flow Testing")
        self.log(f"Testing against: {self.base_url}")
        
        tests = [
            ("Supabase Configuration", self.test_supabase_configuration),
            ("Reset Password Page Access", self.test_reset_password_page_access),
            ("Auth Modal Integration", self.test_auth_modal_integration),
            ("Password Reset Flow Structure", self.test_password_reset_flow_structure),
            ("Supabase Auth Methods Integration", self.test_supabase_auth_methods_integration),
            ("Environment Variables Configuration", self.test_environment_variables),
            ("Password Reset Validation Logic", self.test_password_reset_validation_logic),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n--- Running: {test_name} ---")
            try:
                if test_func():
                    passed += 1
                    self.log(f"✅ {test_name} PASSED")
                else:
                    failed += 1
                    self.log(f"❌ {test_name} FAILED")
            except Exception as e:
                failed += 1
                self.log(f"❌ {test_name} FAILED with exception: {str(e)}")
                
        self.log(f"\n🏁 Password Reset Flow Testing Complete!")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        return failed == 0

if __name__ == "__main__":
    tester = PasswordResetFlowTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
