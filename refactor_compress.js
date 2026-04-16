const fs = require('fs');

let content = fs.readFileSync('d:\\Pixabatch\\project\\app\\[lang]\\compress-image\\page.tsx', 'utf8');

// replace the component signature and add useLocale
content = content.replace(
  "import type { Locale } from '@/lib/i18n/config';",
  "import type { Locale } from '@/lib/i18n/config';\nimport { useLocale } from '@/hooks/useLocale';"
);

content = content.replace(
  "export default function CompressImagePageTranslated({ params }: { params: { lang: string } }) {\n  const lang = (params.lang && Object.keys(dictionaries).includes(params.lang) ? params.lang : 'en') as Locale;\n  const t = dictionaries[lang];",
  "export default function CompressImagePage() {\n  const { locale: lang, localePath } = useLocale();\n  const t = dictionaries[lang];"
);

// replace Link href
// `href={\`${langPrefix}/\`}` to `href={localePath('/')}`
content = content.replace(
  /href=\{`\$\{langPrefix\}\/`\}/g,
  "href={localePath('/')}"
);

// we can remove const langPrefix = lang === 'en' ? '' : `/${lang}`;
content = content.replace(
  "const langPrefix = lang === 'en' ? '' : `/${lang}`;",
  ""
);

// fix FAQ h3 wrapper using regex
content = content.replace(
  /<button\s+onClick=\{\(\) => setOpenFaqIndex\(/g,
  '<h3 className="m-0 p-0 text-base">\\n                    <button\\n                      onClick={() => setOpenFaqIndex('
);
content = content.replace(
  /<ChevronRight className=\{`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform \$\{openFaqIndex === index \? 'rotate-90' : ''\}`\} \/>\s*<\/button>/g,
  "<ChevronRight className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${openFaqIndex === index ? 'rotate-90' : ''}`} />\\n                    </button>\\n                  </h3>"
);

fs.writeFileSync('d:\\Pixabatch\\project\\app\\compress-image\\page.tsx', content);

// Now write the simplified wrapper to app/[lang]
const langContent = `import CompressImagePage from '@/app/compress-image/page';

export default function CompressImageLangPage() {
  return <CompressImagePage />;
}
`;
fs.writeFileSync('d:\\Pixabatch\\project\\app\\[lang]\\compress-image\\page.tsx', langContent);
console.log("Refactoring done!");
