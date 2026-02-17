'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function SetupAdminPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const createAdminUser = async () => {
    setLoading(true);
    setStatus('Creando usuario administrador...');

    try {
      // Crear usuario con email y contraseña (requerirá confirmación por email)
      const { data, error } = await supabase.auth.signUp({
        email: 'mauguerrero96@gmail.com',
        password: 'Cerati96!',
        options: {
          data: {
            user_role: 'admin' // Establecer como administrador
          }
        }
      });

      if (error) {
        setStatus(`❌ Error: ${error.message}`);
      } else {
        setStatus('✅ Usuario administrador creado! Revisa tu email para confirmar.');
        console.log('Usuario creado:', data);
        console.log('📧 Revisa tu email mauguerrero96@gmail.com para confirmar la cuenta');
      }
    } catch (err: any) {
      setStatus(`❌ Error inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Setup Administrador
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Crear cuenta de administrador: mauguerrero96@gmail.com
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Detalles del usuario:</h3>
              <dl className="mt-2 space-y-1">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email:</dt>
                  <dd className="text-sm text-gray-900">mauguerrero96@gmail.com</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contraseña:</dt>
                  <dd className="text-sm text-gray-900">Cerati96!</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rol:</dt>
                  <dd className="text-sm text-gray-900">Administrador</dd>
                </div>
              </dl>
            </div>

            <button
              onClick={createAdminUser}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creando usuario...' : 'Crear Usuario Administrador'}
            </button>

            {status && (
              <div className={`mt-4 p-4 rounded-md ${status.includes('✅')
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
                }`}>
                <p className={`text-sm ${status.includes('✅') ? 'text-green-800' : 'text-red-800'
                  }`}>
                  {status}
                </p>
              </div>
            )}

            <div className="mt-6 text-sm text-gray-600">
              <p><strong>📧 Proceso de Confirmación:</strong></p>
              <ol className="mt-2 list-decimal list-inside space-y-1">
                <li>Después de crear el usuario, recibirás un email en <strong>mauguerrero96@gmail.com</strong></li>
                <li>Busca el email de Supabase con asunto: <em>"Confirm your email"</em></li>
                <li>Haz clic en el link de confirmación en el email</li>
                <li>Una vez confirmado, podrás iniciar sesión</li>
              </ol>
              <p className="mt-3">
                🔗 <strong>Si no encuentras el email:</strong> Revisa tu carpeta de spam/junk
              </p>
              <p className="mt-3">
                Después de confirmar, inicia sesión en{' '}
                <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
                  /auth/login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}