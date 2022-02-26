/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export const seed = async (knex) => {
  // Deletes ALL existing entries
  await knex('reports_attendance').del();
  return await knex('reports_attendance').insert([
    {
      month: 'January', 
      year: '2022',
      sun_m_wk1: 23,
      sun_w_wk1: 45,
      sun_c_wk1: 87
    },
    {
      month: 'January', 
      year: '2022',
      sun_m_wk1: 213,
      sun_w_wk1: 405,
      sun_c_wk1: 687,
      tue_m_wk1: 49,
      tue_w_wk1: 106,
      tue_c_wk1: 211
    },
    {
      month: 'January', 
      year: '2022',
      sun_m_wk1: 23,
      sun_w_wk1: 40,
      sun_c_wk1: 67,
      tue_m_wk1: 29,
      tue_w_wk1: 36,
      tue_c_wk1: 50
    },
    {
      month: 'January', 
      year: '2022',
      sun_m_wk1: 23,
      sun_w_wk1: 40,
      sun_c_wk1: 67,
      tue_m_wk1: 29,
      tue_w_wk1: 36,
      tue_c_wk1: 50,
      sun_m_wk2: 23,
      sun_w_wk2: 40,
      sun_c_wk2: 67,
      tue_m_wk2: 29,
      tue_w_wk2: 36,
      tue_c_wk2: 50,
      sun_m_wk3: 23,
      sun_w_wk3: 40,
      sun_c_wk3: 67,
      tue_m_wk3: 29,
      tue_w_wk3: 36,
      tue_c_wk3: 50,
      thur_m_wk2: 30,
      thur_w_wk2: 56,
      thur_c_wk2: 67
    },
  ]);
}
