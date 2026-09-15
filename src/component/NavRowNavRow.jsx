import { Link } from 'react-router-dom';
import { useVisitedPages } from './PreviousPageContext';

const NavRow = () => {
  const { visitedPages } = useVisitedPages();

  if (!visitedPages.length) return null;

  return (
    <div className="bg-gray-100 p-2 flex gap-4 text-sm">
      {visitedPages.map((page, idx) => (
        <Link key={idx} to={page.path} className="text-blue-600 hover:underline">
          {page.label}
        </Link>
      ))}
    </div>
  );
};

export default NavRow;
