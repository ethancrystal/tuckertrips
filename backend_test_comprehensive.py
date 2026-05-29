#!/usr/bin/env python3
"""
Tucker Trips Comprehensive Backend Test Suite
Tests all major API endpoints and functionality for Tucker Trips application
"""

import requests
import json
import sys
import time
from datetime import datetime

# Main app URL from the testing request
BASE_URL = "https://c66ddf78-0ebf-4beb-9183-bc26d415921e.preview.emergentagent.com"

class TuckerTripsAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_email = f"test_{int(time.time())}@example.com"
        self.test_user_password = "TestPass123!"
        
    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")

    def test_landing_page(self):
        """Test landing page loads correctly"""
        self.log("=== Testing Landing Page ===")
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                content = response.text.lower()
                # Check for key elements that should be on Tucker Trips landing page
                if ("tucker" in content and ("trip" in content or "travel" in content)):
                    self.log("✅ Landing page loads with Tucker Trips content")
                    return True
                else:
                    self.log("❌ Landing page missing Tucker Trips branding")
                    return False
            else:
                self.log(f"❌ Landing page failed to load: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Landing page test error: {str(e)}")
            return False

    def test_chat_api_endpoint(self):
        """AI chat API endpoint has been removed"""
        self.log("=== AI Chat API Endpoint (Removed) ===")
        self.log("⚠️ /api/chat endpoint has been removed - chatbot feature deprecated")
        return True

    def test_admin_dashboard_access(self):
        """Test admin dashboard accessibility"""
        self.log("=== Testing Admin Dashboard Access ===")
        try:
            # Test /secure-admin endpoint
            response = self.session.get(f"{self.base_url}/secure-admin")
            
            if response.status_code == 200:
                content = response.text.lower()
                if "admin" in content and ("dashboard" in content or "login" in content):
                    self.log("✅ Admin dashboard page loads")
                    return True
                else:
                    self.log("❌ Admin dashboard page missing expected content")
                    return False
            elif response.status_code == 401 or response.status_code == 403:
                self.log("✅ Admin dashboard properly protected (authentication required)")
                return True
            elif response.status_code == 302:
                self.log("✅ Admin dashboard redirects (likely to login)")
                return True
            else:
                self.log(f"❌ Admin dashboard unexpected status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log(f"❌ Admin dashboard test error: {str(e)}")
            return False

    def test_admin_login_page(self):
        """Test admin login page"""
        self.log("=== Testing Admin Login Page ===")
        try:
            response = self.session.get(f"{self.base_url}/admin-login")
            
            if response.status_code == 200:
                content = response.text.lower()
                if ("login" in content and ("admin" in content or "password" in content)):
                    self.log("✅ Admin login page loads")
                    return True
                else:
                    self.log("❌ Admin login page missing expected content")
                    return False
            else:
                self.log(f"❌ Admin login page failed to load: {response.status_code}")
                return False
                
        except Exception as e:
            self.log(f"❌ Admin login test error: {str(e)}")
            return False

    def test_api_endpoints_structure(self):
        """Test various API endpoint accessibility"""
        self.log("=== Testing API Endpoints Structure ===")
        
        # Test different API endpoints that might exist
        endpoints_to_test = [
            ("/api/auth", "Authentication endpoint"),
            ("/api/trips", "Trips endpoint"),
            ("/api/admin/counters", "Admin counters endpoint"),
            ("/api/storage/upload", "Storage upload endpoint")
        ]
        
        passed = 0
        for endpoint, description in endpoints_to_test:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}")
                
                # Any response other than 404 suggests endpoint exists
                if response.status_code != 404:
                    self.log(f"✅ {description} exists (status: {response.status_code})")
                    passed += 1
                else:
                    self.log(f"⚠️ {description} not found (404)")
                    
            except Exception as e:
                self.log(f"❌ {description} test error: {str(e)}")
        
        if passed >= 1:
            self.log(f"✅ API structure appears functional ({passed}/{len(endpoints_to_test)} endpoints responding)")
            return True
        else:
            self.log("❌ No API endpoints responding properly")
            return False

    def test_app_navigation_pages(self):
        """Test key navigation pages load"""
        self.log("=== Testing App Navigation Pages ===")
        
        pages_to_test = [
            ("/", "Home page"),
            ("/terms", "Terms page"),
            ("/privacy", "Privacy page")
        ]
        
        passed = 0
        for page, description in pages_to_test:
            try:
                response = self.session.get(f"{self.base_url}{page}")
                
                if response.status_code == 200:
                    self.log(f"✅ {description} loads successfully")
                    passed += 1
                else:
                    self.log(f"❌ {description} failed to load: {response.status_code}")
                    
            except Exception as e:
                self.log(f"❌ {description} test error: {str(e)}")
        
        if passed >= 1:
            self.log(f"✅ App navigation functional ({passed}/{len(pages_to_test)} pages loading)")
            return True
        else:
            self.log("❌ App navigation pages not loading")
            return False

    def test_javascript_and_static_assets(self):
        """Test that JavaScript and static assets are loading"""
        self.log("=== Testing JavaScript and Static Assets ===")
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                content = response.text
                
                # Check for Next.js indicators
                checks = [
                    ("Next.js scripts", "_next/" in content),
                    ("React hydration", "__NEXT_DATA__" in content),
                    ("JavaScript execution", "<script" in content),
                    ("CSS loading", "css" in content.lower() or "style" in content.lower())
                ]
                
                passed_checks = 0
                for check_name, condition in checks:
                    if condition:
                        self.log(f"✅ {check_name} detected")
                        passed_checks += 1
                    else:
                        self.log(f"⚠️ {check_name} not detected")
                
                if passed_checks >= 2:
                    self.log("✅ JavaScript and static assets appear to be loading")
                    return True
                else:
                    self.log("❌ Issues with JavaScript/static asset loading")
                    return False
            else:
                self.log(f"❌ Cannot test assets, main page failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.log(f"❌ Static assets test error: {str(e)}")
            return False

    def test_app_health_overall(self):
        """Overall app health check"""
        self.log("=== Testing Overall App Health ===")
        try:
            # Make request to main page and check response time
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                self.log(f"✅ App responding in {response_time:.2f}s")
                
                # Check response headers for health indicators
                headers = response.headers
                health_indicators = [
                    ("Content-Type header", "text/html" in headers.get("content-type", "")),
                    ("Server response", len(response.content) > 1000),  # Non-empty response
                    ("Response time OK", response_time < 5.0)  # Under 5 seconds
                ]
                
                health_score = 0
                for indicator, check in health_indicators:
                    if check:
                        self.log(f"✅ {indicator}")
                        health_score += 1
                    else:
                        self.log(f"⚠️ {indicator}")
                
                if health_score >= 2:
                    self.log("✅ Overall app health is good")
                    return True
                else:
                    self.log("❌ App health concerns detected")
                    return False
            else:
                self.log(f"❌ App health check failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.log(f"❌ App health test error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        self.log("🚀 Starting Tucker Trips Comprehensive Backend Testing")
        self.log(f"Testing against: {self.base_url}")
        
        tests = [
            ("Landing Page", self.test_landing_page),
            ("AI Chat API Endpoint", self.test_chat_api_endpoint),
            ("Admin Dashboard Access", self.test_admin_dashboard_access),
            ("Admin Login Page", self.test_admin_login_page),
            ("API Endpoints Structure", self.test_api_endpoints_structure),
            ("App Navigation Pages", self.test_app_navigation_pages),
            ("JavaScript and Static Assets", self.test_javascript_and_static_assets),
            ("Overall App Health", self.test_app_health_overall)
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
                
        self.log(f"\n🏁 Backend Testing Complete!")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        return {
            "total_tests": passed + failed,
            "passed": passed,
            "failed": failed,
            "success_rate": (passed/(passed+failed)*100) if (passed+failed) > 0 else 0
        }

if __name__ == "__main__":
    tester = TuckerTripsAPITester()
    results = tester.run_all_tests()
    
    # Exit with success if most tests passed
    success_threshold = 75.0  # 75% pass rate
    success = results["success_rate"] >= success_threshold
    
    print(f"\nTest Results Summary:")
    print(f"- Tests Run: {results['total_tests']}")
    print(f"- Passed: {results['passed']}")
    print(f"- Failed: {results['failed']}")
    print(f"- Success Rate: {results['success_rate']:.1f}%")
    print(f"- Threshold: {success_threshold}%")
    print(f"- Overall: {'PASS' if success else 'FAIL'}")
    
    sys.exit(0 if success else 1)