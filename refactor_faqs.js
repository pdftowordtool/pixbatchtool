const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

function refactorFaq(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has h3 semantic wrap
  if (content.includes('<h3 className="m-0 p-0 text-base">')) {
    return;
  }

  // Look for the FAQ button pattern
  const hasButton = content.includes('onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}');
  if (!hasButton) return;

  const originalPattern = /<button\s+onClick=\{\(\) => setOpenFaqIndex\(openFaqIndex === index \? null : index\)\}\s+className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900\/30 transition-colors"\s*>\s*<span className="text-sm font-medium text-gray-900 dark:text-white pr-4">\s*(?:\{faq\.question\}|faq\.question)\s*<\/span>\s*<ChevronRight\s*className=\{`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform \$\{openFaqIndex === index \? 'rotate-90' : ''\}|`\}\s*\/>\s*<\/button>/g;

  // Since regex might be tricky with multiline react code, let's use a simpler replace strategy:
  // We'll split on the start of the button, and the end of the button
  
  let newContent = content;
  
  newContent = newContent.replace(
    /<button\s+onClick=\{\(\) => setOpenFaqIndex\(/g,
    '<h3 className="m-0 p-0 text-base">\n                  <button\n                    onClick={() => setOpenFaqIndex('
  );
  
  newContent = newContent.replace(
    /<ChevronRight\s+className=\{`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform \$\{\s*openFaqIndex === index \? 'rotate-90' : ''\s*\}`\}\s*\/>\s*<\/button>/g,
    "<ChevronRight\n                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${openFaqIndex === index ? 'rotate-90' : ''}`}\n                  />\n                  </button>\n                </h3>"
  );
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Refactored FAQ in ${filePath}`);
  }
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file === 'page.tsx') {
      refactorFaq(fullPath);
    }
  }
}

processDirectory(appDir);
console.log('Semantics refactoring complete.');
