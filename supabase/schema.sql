-- Borrar tablas si existen para poder recrearlas limpiamente
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS messages;

-- Creación de la tabla de citas
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  "tipoAtencion" TEXT NOT NULL,
  especialista TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  notas TEXT,
  status TEXT DEFAULT 'pendiente',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creación de la tabla de cotizaciones
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  od_esfera TEXT,
  od_cilindro TEXT,
  od_eje TEXT,
  oi_esfera TEXT,
  oi_cilindro TEXT,
  oi_eje TEXT,
  adicion TEXT,
  distancia_pupilar TEXT,
  "tipoLente" TEXT,
  material TEXT,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  folio TEXT,
  "whatsappUrl" TEXT,
  "imageUrl" TEXT,
  status TEXT DEFAULT 'Pendiente',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creación de la tabla de mensajes de contacto
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  date TEXT,
  status TEXT DEFAULT 'new',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Políticas de Seguridad a nivel de Fila (RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ===========================================================
-- POLÍTICAS PARA APPOINTMENTS
-- ===========================================================
-- Cualquiera (anónimo) puede crear una cita
CREATE POLICY "Permitir insertar citas a cualquiera"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- Solo usuarios autenticados pueden leer, editar o borrar
CREATE POLICY "Permitir leer citas a autenticados"
  ON appointments FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Permitir actualizar citas a autenticados"
  ON appointments FOR UPDATE
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Permitir eliminar citas a autenticados"
  ON appointments FOR DELETE
  USING ((select auth.uid()) IS NOT NULL);

-- ===========================================================
-- POLÍTICAS PARA QUOTES
-- ===========================================================
CREATE POLICY "Permitir insertar cotizaciones a cualquiera"
  ON quotes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir leer cotizaciones a autenticados"
  ON quotes FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Permitir actualizar cotizaciones a autenticados"
  ON quotes FOR UPDATE
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Permitir eliminar cotizaciones a autenticados"
  ON quotes FOR DELETE
  USING ((select auth.uid()) IS NOT NULL);

-- ===========================================================
-- POLÍTICAS PARA MESSAGES
-- ===========================================================
CREATE POLICY "Permitir insertar mensajes a cualquiera"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir leer mensajes a autenticados"
  ON messages FOR SELECT
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Permitir actualizar mensajes a autenticados"
  ON messages FOR UPDATE
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Permitir eliminar mensajes a autenticados"
  ON messages FOR DELETE
  USING ((select auth.uid()) IS NOT NULL);

-- Activar Realtime para la tabla de messages (para que el dashboard se actualice solo)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
