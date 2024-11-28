if (process.env.TIFSHARED_JS === 'true') { 
  // reason: cannot use 'import' in prepare script
  const fs = require('fs');
  const path = require('path');
  const { execSync } = require('child_process');

  // Path to the file to rename
  const sourcePath = path.resolve(__dirname, '../index.js');
  const targetPath = path.resolve(__dirname, '../index.ts');

  // Rename the file
  try {
    if (fs.existsSync(sourcePath)) {
      fs.renameSync(sourcePath, targetPath);
      console.log(`Renamed ${sourcePath} to ${targetPath}`);
    } else {
      console.warn(`File ${sourcePath} does not exist. Skipping rename.`);
    }
  } catch (error) {
    console.error(`Error renaming file: ${error.message}`);
    process.exit(1); // Exit with an error code
  }

  // Run npm build command
  execSync('npm run build', { stdio: 'inherit', env: process.env });
}