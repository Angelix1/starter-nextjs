// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(102);
  

  sleep(45_000).then(() => res.status(200).json({ name: 'John Doe' }))
}
