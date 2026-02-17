'use client'

import { useState } from 'react'
import { supabase } from '../../utils/supabase/client'

export default function TestPage() {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d887af37-1e7d-42af-b843-9db58c4efa9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test/page.tsx:7',message:'TestPage component render',data:{hasUseState:typeof useState !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d887af37-1e7d-42af-b843-9db58c4efa9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test/page.tsx:12',message:'State variables initialized',data:{loading:loading,testResult:testResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const testConnection = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d887af37-1e7d-42af-b843-9db58c4efa9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test/page.tsx:18',message:'testConnection called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    setLoading(true)
    setTestResult(null)
    const { data, error } = await supabase
      .from('clubs_mccarren_tournament') // usa una tabla real que EXISTE
      .select('*')
      .limit(1)

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d887af37-1e7d-42af-b843-9db58c4efa9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test/page.tsx:22',message:'Supabase query completed',data:{hasError:!!error,hasData:!!data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    if (error) {
      console.error('❌ Supabase error:', error)
      setTestResult(`❌ Error: ${error.message}`)
    } else {
      console.log('✅ Supabase connected:', data)
      setTestResult('✅ Conexión exitosa con Supabase')
    }
    setLoading(false)

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d887af37-1e7d-42af-b843-9db58c4efa9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test/page.tsx:30',message:'testConnection completed',data:{loading:false,hasTestResult:!!testResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative bg-black/20 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-5">
              <div className="relative group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:shadow-purple-400/70 transition-all duration-500 group-hover:scale-110 rotate-6 group-hover:rotate-0">
                  <span className="text-white font-black text-3xl drop-shadow-2xl filter">🧪</span>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white drop-shadow-2xl tracking-tight">
                  CONNECTION
                  <br />
                  <span className="text-2xl font-semibold text-purple-300">DIAGNOSTICS</span>
                </h1>
                <p className="text-sm text-purple-200 font-medium tracking-widest uppercase">Test Supabase Setup</p>
              </div>
            </div>
            <a
              href="/dashboard"
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-500/50 flex items-center space-x-2"
            >
              <span>←</span>
              <span>BACK TO DASHBOARD</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Diagnóstico de Conexión
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verifica que tu aplicación esté conectada correctamente a Supabase
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
            process.env.NEXT_PUBLIC_SUPABASE_URL
              ? 'bg-green-50 border-green-200 shadow-green-100 shadow-lg'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                process.env.NEXT_PUBLIC_SUPABASE_URL ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <span className="text-white text-2xl">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? '🔗' : '❌'}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
              URL de Supabase
            </h3>
            <p className={`text-sm text-center ${
              process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-700' : 'text-red-700'
            }`}>
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada correctamente' : 'Falta configurar NEXT_PUBLIC_SUPABASE_URL'}
            </p>
          </div>

          <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
              ? 'bg-green-50 border-green-200 shadow-green-100 shadow-lg'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <span className="text-white text-2xl">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '🔑' : '❌'}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
              Clave API
            </h3>
            <p className={`text-sm text-center ${
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-700' : 'text-red-700'
            }`}>
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada correctamente' : 'Falta configurar NEXT_PUBLIC_SUPABASE_ANON_KEY'}
            </p>
          </div>
        </div>

        {/* Test Button */}
        <div className="text-center mb-8">
          <button
            onClick={testConnection}
            disabled={loading}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white hover:shadow-xl transform hover:-translate-y-1'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Probando conexión...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <span>🧪</span>
                <span>Probar Conexión con Supabase</span>
              </div>
            )}
          </button>
        </div>

        {/* Results */}
        {testResult && (
          <div className={`p-6 rounded-xl border-2 shadow-lg ${
            testResult.includes('✅')
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                testResult.includes('✅') ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <span className="text-white text-xl">
                  {testResult.includes('✅') ? '✅' : '❌'}
                </span>
              </div>
            </div>
            <h3 className={`text-xl font-semibold text-center mb-2 ${
              testResult.includes('✅') ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.includes('✅') ? '¡Conexión Exitosa!' : 'Error de Conexión'}
            </h3>
            <p className={`text-center ${
              testResult.includes('✅') ? 'text-green-700' : 'text-red-700'
            }`}>
              {testResult}
            </p>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔍</span>
            Información de Debug
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">URL de Supabase:</span>
              <code className="bg-white px-2 py-1 rounded text-xs">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || 'No configurada'}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clave API presente:</span>
              <span className={`font-medium ${
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'
              }`}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Sí' : 'No'}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Esta información se muestra solo en modo desarrollador para facilitar el diagnóstico.
          </p>
        </div>
      </main>
    </div>
  )
}