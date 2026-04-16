import ResizeImagePage from '@/app/image-resizer/page';

export default function ResizeImagePageLangPage({ params }: { params: { lang: string } }) {
  return <ResizeImagePage params={params} />;
}
