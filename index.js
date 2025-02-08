const fs = require('fs').promises; // Use promises for async/await
const path = require('path');

// Define file type categories
const fileTypes = {
  Images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
  Documents: ['.pdf', '.docx', '.txt', '.xlsx', '.pptx'],
  Videos: ['.mp4', '.mkv', '.avi', '.mov'],
};

// Function to organize files
const organizeFiles = async (directoryPath) => {
  try {
    // Read all files in the directory
    const files = await fs.readdir(directoryPath);

    // Create folders for each file type
    for (const folderName in fileTypes) {
      const folderPath = path.join(directoryPath, folderName);
      await fs.mkdir(folderPath, { recursive: true });
    }

    // Create an "Others" folder for uncategorized files
    const othersFolderPath = path.join(directoryPath, 'Others');
    await fs.mkdir(othersFolderPath, { recursive: true });

    // Log operations
    let summary = '';

    // Move files to their respective folders
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const fileStats = await fs.stat(filePath);

      if (fileStats.isFile()) {
        const fileExtension = path.extname(file).toLowerCase();
        let moved = false;

        // Check file type and move accordingly
        for (const [folderName, extensions] of Object.entries(fileTypes)) {
          if (extensions.includes(fileExtension)) {
            const destinationFolder = path.join(directoryPath, folderName, file);
            await fs.rename(filePath, destinationFolder);
            summary += `Moved: ${file} -> ${folderName}\n`;
            moved = true;
            break;
          }
        }

        // Move to "Others" if not categorized
        if (!moved) {
          const destinationFolder = path.join(directoryPath, 'Others', file);
          await fs.rename(filePath, destinationFolder);
          summary += `Moved: ${file} -> Others\n`;
        }
      }
    }

    // Write summary to a log file
    const summaryFilePath = path.join(directoryPath, 'summary.txt');
    await fs.writeFile(summaryFilePath, summary);

    console.log('Files organized successfully!');
    console.log('Summary logged to:', summaryFilePath);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Accept directory path from the user
const directoryPath = process.argv[2];

if (!directoryPath) {
  console.log('Please provide a directory path.');
} else {
  organizeFiles(directoryPath);
}