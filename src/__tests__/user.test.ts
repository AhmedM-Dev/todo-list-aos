/* eslint-disable @typescript-eslint/no-explicit-any */
import _fetch from 'isomorphic-fetch'
import nock from 'nock'

describe('User management', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  it('Gets a new authorization token', async () => {
    nock('http://localhost:4000')
      .post('/graphql')
      .reply(200, {
        data: {
          getToken:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhjNWZmYmE4LWQ4ODctNDBhYy05NGVhLTk1N2Y3Nzk3YjgzNiIsImVtYWlsIjoiYWRtaW5AdG9kb2xpc3QuYW9zIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsInBhc3N3b3JkIjoiJDJ5JDEwJFNwd0ZLc1loYVNXbHB4dGs2VU5LY2VwLjl1Q1BPdWx0QzBGb3YwTUdrY2dWZnIvdFFWWTg2IiwiaWF0IjoxNjIyNjcyOTkzfQ.CahZp6Gv0k4Gd8saFW6s65SD6c1edQIP0ZAvzlLVQT0'
        }
      })

    const result = await _fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // The query we are sending to the GraphQL API
      body: JSON.stringify({
        query: `query {
          getToken(email: "test@test.aos", password: "test")
        }`
      })
    }).then((res: any) => res.json())

    expect(result).toStrictEqual({
      data: {
        getToken:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhjNWZmYmE4LWQ4ODctNDBhYy05NGVhLTk1N2Y3Nzk3YjgzNiIsImVtYWlsIjoiYWRtaW5AdG9kb2xpc3QuYW9zIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsInBhc3N3b3JkIjoiJDJ5JDEwJFNwd0ZLc1loYVNXbHB4dGs2VU5LY2VwLjl1Q1BPdWx0QzBGb3YwTUdrY2dWZnIvdFFWWTg2IiwiaWF0IjoxNjIyNjcyOTkzfQ.CahZp6Gv0k4Gd8saFW6s65SD6c1edQIP0ZAvzlLVQT0'
      }
    })
  })

  // it('Gets the list of users', () => {})
})
