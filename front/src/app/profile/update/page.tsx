'use client';
import { useFormState } from 'react-dom';

export default function UpdateProfilePage() {
  const [state, formAction] = useFormState(updateProfile, null);

  async function updateProfile(prevState: any, formData: FormData) {
    // Логика обновления профиля
  }

  return (
    <div className="container">
      <form action={formAction} encType="multipart/form-data">
        {/* Поля формы */}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}