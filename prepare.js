if (process.env.TIFSHARED_TS !== 'true') { 
  require('child_process').execSync('npm run build', { stdio: 'inherit', env: process.env })
  console.log('Built js package. If you would like to see the typescript version of the package, reinstall with the TIFSHARED_TS env variable set to true.')
}