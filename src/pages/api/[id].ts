import { NextApiRequest, NextApiResponse } from "next";
import { fauna } from '../../config/db';
import { query as q } from 'faunadb';

export default async function handleTask(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query
    if (req.method == 'PUT') {


        await fauna.query(
            q.Update(
                q.Ref(q.Collection('tasks'), id),
                { data: req.body }
            ))

        return res.status(200).json({ data: req.body })
    }

    if (req.method == 'DELETE') {
        await fauna.query(
            q.Delete(
                q.Ref(q.Collection('tasks'), id)

            ))

        return res.status(200).json({})
    }

}