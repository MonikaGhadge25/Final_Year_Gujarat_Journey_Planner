#!/usr/bin/env python3
import json
import base64
import binascii
from PIL import Image
import io

def test_base64_image(base64_string):
    """Test if a base64 string represents a valid image"""
    try:
        # Try to decode the base64 string
        decoded_data = base64.b64decode(base64_string)
        
        # Try to open as an image
        image = Image.open(io.BytesIO(decoded_data))
        
        # Get image info
        print(f"Image format: {image.format}")
        print(f"Image size: {image.size}")
        print(f"Image mode: {image.mode}")
        print("Base64 string is a valid image!")
        return True
        
    except (base64.binascii.Error, base64.binascii.Incomplete) as e:
        print(f"Base64 decoding error: {e}")
        return False
    except Exception as e:
        print(f"Image processing error: {e}")
        return False

def analyze_json_images(json_file_path):
    """Analyze all images in the JSON file"""
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        total_hotels = len(data)
        total_images = 0
        valid_images = 0
        
        print(f"Total hotels: {total_hotels}")
        
        for i, hotel in enumerate(data):
            hotel_name = hotel.get('hotel_details', {}).get('hotel_name', f'Hotel {i+1}')
            print(f"\nAnalyzing {hotel_name}:")
            
            # Check all image fields
            image_fields = ['image', 'img_1', 'img_2', 'img_3', 'img_4', 'img_5']
            hotel_images = 0
            hotel_valid = 0
            
            for field in image_fields:
                if field in hotel:
                    total_images += 1
                    hotel_images += 1
                    
                    binary_data = hotel[field].get('$binary', {})
                    base64_data = binary_data.get('base64', '')
                    
                    if base64_data:
                        print(f"  {field}: Base64 length = {len(base64_data)}")
                        if test_base64_image(base64_data):
                            valid_images += 1
                            hotel_valid += 1
                        else:
                            print(f"    Invalid image data in {field}")
                    else:
                        print(f"  {field}: No base64 data found")
            
            print(f"  Hotel summary: {hotel_valid}/{hotel_images} valid images")
        
        print(f"\nOverall summary:")
        print(f"Total images found: {total_images}")
        print(f"Valid images: {valid_images}")
        print(f"Invalid images: {total_images - valid_images}")
        
    except Exception as e:
        print(f"Error analyzing JSON: {e}")

if __name__ == "__main__":
    json_file = r"C:\Users\Dell\Desktop\Project\Final-Year-Project\gujarat_tour_travel.hotels_11-10.json"
    analyze_json_images(json_file)