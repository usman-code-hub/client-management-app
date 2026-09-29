import { useState } from 'react';
import EnhancementForm from '../components/forms/EnhancementForm.jsx';
import { FixesPage } from './Testing';

export default function Enhancements() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return <FixesPage title="Enhancements" description="Feature requests and improvements" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}><EnhancementForm /></FixesPage>;
}