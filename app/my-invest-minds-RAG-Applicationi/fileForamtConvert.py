import os

# Path to your Dataset folder
folder = "Dataset"

for filename in os.listdir(folder):
    old_path = os.path.join(folder, filename)

    # Skip if it's already a .txt file
    if filename.endswith(".txt"):
        continue

    # Build new filename with .txt extension
    new_filename = f"{filename}.txt"
    new_path = os.path.join(folder, new_filename)

    # Rename file
    os.rename(old_path, new_path)
    print(f"Renamed: {filename} -> {new_filename}")

print("✅ All files converted to .txt format")
