const fs = require('fs');

function cleanFile(filePath, keepStrategy) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // This regex matches a git conflict block.
  // Group 1: ours (HEAD)
  // Group 2: theirs (incoming)
  const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> [0-9a-fA-F]+\r?\n/g;
  
  content = content.replace(regex, (match, ours, theirs) => {
    if (keepStrategy === 'ours') return ours;
    if (keepStrategy === 'theirs') return theirs;
    if (keepStrategy === 'both') return ours + '\n' + theirs;
    return ours; // default
  });

  // some might be nested or have different markers due to manual edits
  const fallbackRegex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> .*\r?\n/g;
  content = content.replace(fallbackRegex, (match, ours, theirs) => {
    if (keepStrategy === 'ours') return ours;
    if (keepStrategy === 'theirs') return theirs;
    return ours;
  });

  // remove standalone rmeimport typo
  content = content.replace(/rmeimport/g, 'import');

  fs.writeFileSync(filePath, content);
  console.log('Cleaned ' + filePath);
}

cleanFile('src/components/Slideshow.jsx', 'ours');   // keep our nice UI
cleanFile('src/pages/Authority.jsx', 'both');      // keep our feedback button AND their fraud logic
cleanFile('src/pages/Hospital.jsx', 'ours');       // Hospital.jsx seems to have duplicated Authority logic in theirs, keep ours

// Also attempt to git add
require('child_process').execSync('git add .');

