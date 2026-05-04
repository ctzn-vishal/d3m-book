import { BookHome } from '@/components/Book/BookHome';
import { book } from '@/lib/book-toc';

export default function HomePage() {
  return <BookHome book={book} />;
}
