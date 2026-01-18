// // scripts/setup-db.ts

// import { Pool } from 'pg';
// import dotenv from 'dotenv';

// dotenv.config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL_EMBEDDINGS,
// });

// async function setupDatabase() {
//   const client = await pool.connect();
//   try {
//     console.log('Connecting to the embeddings database...');
    
//     // This is still good practice.
//     await client.query(`ALTER DATABASE "investMindEmbeddings" SET search_path TO public`);
//     console.log('✅ Embeddings database search_path set to "public".');

//     await client.query('CREATE EXTENSION IF NOT EXISTS vector');
//     console.log('✅ "vector" extension is enabled.');

//     // THE FIX: Explicitly create the table in the 'public' schema.
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS public.investmind_embeddings (
//         id TEXT PRIMARY KEY,
//         embedding VECTOR(768), 
//         metadata JSONB,
//         text TEXT
//       )
//     `);
//     console.log('✅ "public.investmind_embeddings" table is created.');
    
//     console.log('Embeddings database setup complete!');
//   } catch (error) {
//     console.error('❌ Error setting up the embeddings database:', error);
//   } finally {
//     await client.release();
//     await pool.end();
//   }
// }

// setupDatabase();