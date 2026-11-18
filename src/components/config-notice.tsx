import * as React from 'react';
import type {ConfigError} from '../utils/config';

/**
 * Explains why a shared link's settings were not used
 */
export function ConfigNotice({errors}: {errors: ConfigError[]}) {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;

  return (
    <div className="notice" role="alert">
      <p>
        <strong>This link's settings couldn't be used.</strong> The machine
        starts from its default setup instead.
      </p>
      <ul>
        {errors.map((error, index) => (
          <li key={index} data-code={error.code}>
            {error.message}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setDismissed(true)}>
        Dismiss
      </button>
    </div>
  );
}
