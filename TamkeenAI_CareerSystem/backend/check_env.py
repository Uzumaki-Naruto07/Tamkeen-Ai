import os
import sys
from dotenv import load_dotenv

# Load environment variables
print("Loading environment variables...")
load_dotenv()

# Check for HF_TOKEN
print(f"HF_TOKEN from environment: {os.environ.get('HF_TOKEN')}")

# Print all environment variables for debugging
print("\nAll environment variables:")
env_vars = dict(os.environ)
for key, value in env_vars.items():
    # Only print the first few characters of values to avoid exposing sensitive data
    if value and len(value) > 10:
        printed_value = value[:5] + "..." + value[-2:]
    else:
        printed_value = value
    print(f"{key}: {printed_value}")

# Check .env file
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
print(f"\nChecking for .env file at: {env_path}")
if os.path.exists(env_path):
    print(".env file exists")
    with open(env_path, 'r') as f:
        contents = f.read()
        # Extract and print just the lines mentioning HF_TOKEN, without showing the actual token
        for line in contents.split('\n'):
            if 'HF_TOKEN' in line:
                parts = line.split('=', 1)
                if len(parts) > 1:
                    key = parts[0].strip()
                    value = parts[1].strip()
                    # Only print a masked version of the token
                    if len(value) > 10:
                        masked_value = value[:5] + "..." + value[-2:]
                    else:
                        masked_value = value
                    print(f"Found in .env: {key}={masked_value}")
                else:
                    print(f"Found in .env: {line}")
else:
    print(".env file does not exist")

print("\nDone checking environment variables.") 