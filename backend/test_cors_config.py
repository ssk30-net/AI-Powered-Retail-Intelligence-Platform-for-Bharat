"""
Test script to verify CORS_ORIGINS configuration works with different formats
"""
import os
import sys

# Test different CORS_ORIGINS formats
test_cases = [
    ("*", "Simple wildcard string"),
    ('["*"]', "JSON array with wildcard"),
    ('["http://example.com"]', "JSON array with single URL"),
    ('["http://example.com","https://example.com"]', "JSON array with multiple URLs"),
]

print("Testing CORS_ORIGINS configuration...\n")

for test_value, description in test_cases:
    print(f"Test: {description}")
    print(f"Input: {test_value}")
    
    # Set environment variable
    os.environ['CORS_ORIGINS'] = test_value
    
    try:
        # Import fresh settings
        if 'app.core.config' in sys.modules:
            del sys.modules['app.core.config']
        
        from app.core.config import settings
        
        print(f"✅ SUCCESS - Parsed as: {settings.CORS_ORIGINS}")
        print(f"   Type: {type(settings.CORS_ORIGINS)}")
        
    except Exception as e:
        print(f"❌ FAILED - Error: {e}")
    
    print("-" * 60)

print("\n✅ All tests completed!")
