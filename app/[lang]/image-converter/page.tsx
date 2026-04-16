import ImageConverterPage from '@/app/image-converter/page';

export default function ImageConverterPageLangPage({ params }: { params: { lang: string } }) {
  return <ImageConverterPage params={params} />;
}
