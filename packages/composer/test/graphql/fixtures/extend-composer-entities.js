'use strict'

module.exports = {
  schema: `
    extend type Artist {
      songs: [Song]
      movies: [Movie]
    }

    extend type Song {
      singer: Artist
    }

    extend type Movie {
      director: Artist
    }

    extend type Query {
      songArtists (ids: [ID!]!): [Artist]
      movieArtists (ids: [ID!]!): [Artist]
    }
  `,

  resolvers: {
    Movie: {
      director: (parent, args, context, info) => {
        return parent?.directorId ? { id: parent.directorId } : null
      }
    },
    Song: {
      singer: (parent, args, context, info) => {
        return parent?.singerId ? { id: parent.singerId } : null
      }
    },
    Artist: {
      // TODO dataloader here
      songs: async (parent, args, context, info) => {
        // TODO return graphql request subgraphs['songs'] query
        const songs = []
        // await composer.platformatic.entities.song.find({
        //   where: { singerId: { eq: parent.id } },
        //   fields: graphqlSelectionFields(info, 'songs'),
        //   ctx: null
        // })
        return songs
      },
      // TODO dataloader here
      movies: async (parent, args, context, info) => {
        // TODO return graphql request subgraphs['movies'] query
        const movies = []
        // await composer.platformatic.entities.movie.find({
        //   where: { directorId: { eq: parent.id } },
        //   fields: graphqlSelectionFields(info, 'movies'),
        //   ctx: null
        // })
        return movies
      }
    },
    Query: {
      songArtists: async (parent, args, context, info) => {
        return args.ids.map(id => ({ id }))
      },
      movieArtists: async (parent, args, context, info) => {
        return args.ids.map(id => ({ id }))
      }
    }
  }
}
