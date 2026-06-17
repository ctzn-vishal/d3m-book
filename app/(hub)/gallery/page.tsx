import { redirect } from 'next/navigation';

// The gallery is now the home page. Keep /gallery working for old links.
export default function GalleryRedirect() {
  redirect('/');
}
