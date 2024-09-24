if (process.env.TIFSHARED_JS === 'true') { 
  // reason: cannot use 'import' in prepare script
  require('child_process').execSync('npm run build', { stdio: 'inherit', env: process.env })
}