import { useParams } from 'react-router-dom';

export default function SectionPage() {
  const { section } = useParams();
  return <h1>SectionPage: {section}</h1>;
}
