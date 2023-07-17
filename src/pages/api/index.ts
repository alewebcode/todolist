import { NextApiRequest, NextApiResponse } from "next";
import { fauna } from '../../config/db';
import { Index, Match, query as q } from 'faunadb';
import { getSession, useSession } from "next-auth/react";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req })

    if (req.method == 'GET' && session) {

        const user = await fauna.query(
            q.Map(
                q.Paginate(
                    Match(Index("user_by_email"), session.user.email)
                ),
                q.Lambda(
                    "user_id",
                    q.Get(q.Var("user_id"))
                )
            )



        )


        if (user['data'].length) {
            let query = await fauna.query(

                q.Map(

                    q.Paginate(q.Match(q.Index('tasks_by_userId'), user['data'][0]['ref'].id)),
                    q.Lambda((show) => q.Get(show))

                ),

            )



            return res.status(200).json({ query })
        } else {


            return res.status(200).json({})
        }



    }
    if (req.method == 'POST') {

        const { description, due_date, user } = req.body


        let query = await fauna.query(
            q.Map(
                q.Paginate(
                    Match(Index("user_by_email"), user)
                ),
                q.Lambda(
                    "user",
                    q.Get(q.Var("user"))
                )
            )



        )


        const result_user = !query['data'].length ? await fauna.query(
            q.Create(q.Collection('users'), {
                data: {
                    email: user
                }
            })
        ) : query['data'][0]['ref'].id



        const ret = await fauna.query(
            q.Create(q.Collection('tasks'), {
                data: {
                    description,
                    due_date,
                    completed: false,
                    user_id: result_user ? result_user : query['ref'].id
                }
            })
        )



        const data = {
            id: ret['ref'].id,
            description: ret['data'].description,
            due_date: ret['data'].due_date,
            completed: null
        }


        return res.status(200).json({ data })

    }
    if (req.method == 'PUT') {
        const { id, completed } = req.body

        await fauna.query(
            q.Update(
                q.Ref(q.Collection('tasks'), id),
                { data: { completed } }
            ))

        return res.status(200).json({})
    }
}