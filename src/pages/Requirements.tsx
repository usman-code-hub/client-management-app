import { useState } from 'react';
import RequirementForm from '../components/forms/RequirementForm.jsx';
import { FixesPage } from './Testing';

export default function Requirements() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return <FixesPage title="Requirements" description="Manage client needs and acceptance criteria" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}><RequirementForm /></FixesPage>;
}