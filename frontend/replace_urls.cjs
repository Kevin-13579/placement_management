const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if(file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src/pages');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace 'http://localhost:8080/api...'
    content = content.replace(/'http:\/\/localhost:8080([^']*)'/g, "`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}$1`");
    
    // Replace `http://localhost:8080/api...`
    content = content.replace(/`http:\/\/localhost:8080([^`]*)`/g, "`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}$1`");
    
    // Replace "http://localhost:8080/api..."
    content = content.replace(/"http:\/\/localhost:8080([^"]*)"/g, "`${import.meta.env.VITE_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com'}$1`");

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Replaced all API URLs');
