/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
 import { promises as fs } from 'fs';

 export const seed = async knex => {
   try {
	 const rawData = await fs.readFile('db/seeds/csr_data.json');
	 const data = JSON.parse(rawData);
	 // Deletes ALL existing entries
	 await knex('csr_reports').del();
   
	 return await knex('csr_reports').insert(data);
   } catch (error) {
	 console.error(error);
   }
 }