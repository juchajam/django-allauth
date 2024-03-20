import { useState, useEffect } from 'react'
import { useConfig } from '../auth'
import * as allauth from '../lib/allauth'
import FormErrors from '../FormErrors'

export default function Sessions () {
  const config = useConfig()
  const [sessions, setSessions] = useState([])
  const [response, setResponse] = useState({ fetching: false, content: { status: 200, data: [] } })

  useEffect(() => {
    setResponse((r) => { return { ...r, fetching: true } })
    allauth.getSessions().then((resp) => {
      if (resp.status === 200) {
        setSessions(resp.data)
      }
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }, [])

  function logoutElsewhere () {
    logout(sessions.filter(session => !session.is_current))
  }

  function logout (sessions) {
    setResponse({ ...response, fetching: true })
    allauth.endSessions(sessions.map(s => s.id)).then((resp) => {
      setResponse((r) => { return { ...r, content: resp } })
      if (resp.status === 200) {
        setSessions(resp.data)
      }
    }).catch((e) => {
      console.error(e)
      window.alert(e)
    }).then(() => {
      setResponse((r) => { return { ...r, fetching: false } })
    })
  }

  return (
    <div>
      <h1>Sessions</h1>

      <table>
        <thead>
          <tr>
            <th>Started At</th>
            <th>IP Address</th>
            <th>Browser</th>
            {config.data.usersessions.track_activity ? <th>Last Seen At</th> : null}
            <th>Current</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session, i) => {
            return (
              <tr key={i}>
                <td>{new Date(session.created_at).toLocaleString()}</td>
                <td>{session.ip}</td>
                <td>{session.user_agent}</td>
                {config.data.usersessions.track_activity ? <td>{session.last_seen_at}</td> : null}
                <td>{session.is_current ? '⭐' : ''}</td>
                <td><button onClick={() => logout([session])}>Logout</button></td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <button onClick={() => logoutElsewhere()}>Logout elsewhere</button>

    </div>
  )
}