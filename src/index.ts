import { GraphQLServer, Options, OptionsWithHttps } from 'graphql-yoga'
import { GraphQLDate as Date, GraphQLTime as Time, GraphQLDateTime as DateTime } from 'graphql-iso-date'
import GraphQLJSON from 'graphql-type-json'

import { info, error } from './config/logging'
import { Props } from 'graphql-yoga/dist/types'
import { createClient } from './api-client/client'
import { organizations } from './resolvers'
import { bookings } from './resolvers'
import { users } from './resolvers'
import { employees } from './resolvers'
import { property } from './resolvers'
import {unit } from './resolvers'


// await info(returnValue, { params: { name } })

const resolvers = {
  Date,
  Time,
  DateTime,
  JSON: GraphQLJSON,

  Query: {
    organizations,
    property,
    bookings,
    users,
    employees,
    unit
    
  },

}

type ServerOptions = Options | OptionsWithHttps | Props<any> | any

const options: ServerOptions = {
  port: process.env.PORT || 4000,
  typeDefs: ['./src/schema.graphql'],
  resolvers,
  playground: '/',
  context(context) {
    const Authorization = context.request.get('Authorization')
    if (!Authorization) throw Error(`Not Authorized with: ${Authorization}`)

    const client = createClient(Authorization)
    return {
      ...context,
      client,
    }
  },
  debug: true,
  tracing: true,
  logFunction: message => {
    console.log(message)
    info(message.key, message.data)
  },
}

const server: GraphQLServer = new GraphQLServer(options)

export default server
  .start(() => console.log(`Started: http://localhost:${options.port}`))
  .catch(err => {
    console.log(err)
    return error(err)
  })
