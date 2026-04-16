const fs = require('fs');
const path = require('path');

function unify(toolDir, componentName) {
  const langPagePath = path.join('d:\\Pixabatch\\project\\app\\[lang]', toolDir, 'page.tsx');
  const rootPagePath = path.join('d:\\Pixabatch\\project\\app', toolDir, 'page.tsx');
  
  if (!fs.existsSync(langPagePath)) {
    console.log(`Skip ${toolDir}: no [lang] page`);
    return;
  }
  
  let content = fs.readFileSync(langPagePath, 'utf8');

  // Add useLocale
  if (!content.includes('useLocale')) {
    content = content.replace(
      "import type { Locale } from '@/lib/i18n/config';",
      "import type { Locale } from '@/lib/i18n/config';\nimport { useLocale } from '@/hooks/useLocale';"
    );
  }

  // Replace component signature
  const regexSig = new RegExp(`export default function ${componentName}Translated\\(\\{.*\\} : .*\\) \\{`);
  content = content.replace(
    regexSig,
    `export default function ${componentName}() {`
  );

  // Replace lang initialization
  content = content.replace(
    /const lang \= \(params\.lang.*\n.*const t \= dictionaries\[lang\];/,
    "const { locale: lang, localePath } = useLocale();\n  const t = dictionaries[lang];"
  );
  
  // Replace Link hrefs
  content = content.replace(
    /const langPrefix \= lang \=\=\= 'en' \? '' : \`\/\$\{lang\}\`;/g,
    ""
  );
  
  content = content.replace(
    /href=\{`${langPrefix}\/`\}/g,
    "href={localePath('/')}"
  );
  content = content.replace(
    /href=\{`\$\{langPrefix\}\/`\}/g,
    "href={localePath('/')}"
  );

  // Apply semantic HTML fixes to FAQ arrays (if not already applied)
  content = content.replace(
    /<button\s+onClick=\{\(\) => setOpenFaqIndex\(/g,
    '<h3 className="m-0 p-0 text-base">\n                    <button\n                      onClick={() => setOpenFaqIndex('
  );
  content = content.replace(
    /<ChevronRight\s+className=\{`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform \$\{openFaqIndex === index \? 'rotate-90' : ''\s*}`\}\s*\/>\s*<\/button>/g,
    "<ChevronRight className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${openFaqIndex === index ? 'rotate-90' : ''}`} />\n                    </button>\n                  </h3>"
  );

  // Write to root
  fs.writeFileSync(rootPagePath, content);
  
  // Write wrapper to [lang]
  const langContent = `import ${componentName} from '@/app/${toolDir}/page';\n\nexport default function ${componentName}LangPage() {\n  return <${componentName} />;\n}\n`;
  fs.writeFileSync(langPagePath, langContent);
  
  console.log(`Unification complete for ${toolDir}`);
}

unify('optimize-image', 'OptimizePage');
unify('image-resizer', 'ResizeImagePage');
unify('image-converter', 'ImageConverterPage');
