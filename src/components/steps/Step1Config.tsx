import { Row, Col, Input } from 'antd';
import type { Credentials } from '@/types';
import type { FieldErrors } from '@/utils/validators';
import { Card, FormField, NoteBox, Button, StepActions } from '@/components/shared';

interface Step1Props {
  credentials: Credentials;
  updateField: <K extends keyof Credentials>(field: K, value: string) => void;
  touchField: (field: keyof Credentials) => void;
  clearCredentials: () => void;
  isComplete: boolean;
  fieldErrors: FieldErrors;
  onContinue: () => void;
}

export function Step1Config({
  credentials,
  updateField,
  touchField,
  clearCredentials,
  isComplete,
  fieldErrors,
  onContinue,
}: Step1Props) {
  return (
    <div>
      <Card title="API Credentials">
        <FormField
          label="GROQ API KEY"
          hint="console.groq.com/keys -> Create API Key (free)"
          error={fieldErrors.openrouterKey}
        >
          {({ id }) => (
            <Input.Password
              id={id}
              placeholder="gsk_..."
              value={credentials.openrouterKey}
              onChange={(e) => updateField('openrouterKey', e.target.value)}
              onBlur={() => touchField('openrouterKey')}
            />
          )}
        </FormField>

        <FormField
          label="AI MODEL"
          hint="Groq model ID (optional) — must be enabled for your Groq project, check console.groq.com/playground. Leave blank for default."
        >
          {({ id }) => (
            <Input
              id={id}
              placeholder="openai/gpt-oss-20b"
              value={credentials.model ?? ''}
              onChange={(e) => updateField('model', e.target.value)}
            />
          )}
        </FormField>

        <FormField
          label="TEMPO API TOKEN"
          hint="Tempo -> Settings -> API Integration -> New Token"
          error={fieldErrors.tempoToken}
        >
          {({ id }) => (
            <Input.Password
              id={id}
              placeholder="your-tempo-token"
              value={credentials.tempoToken}
              onChange={(e) => updateField('tempoToken', e.target.value)}
              onBlur={() => touchField('tempoToken')}
            />
          )}
        </FormField>

        <FormField
          label="JIRA ACCOUNT ID"
          hint="Jira profile URL -> accountId in the URL"
          error={fieldErrors.accountId}
        >
          {({ id }) => (
            <Input
              id={id}
              placeholder="5b10a2844c20165700ede21g"
              value={credentials.accountId}
              onChange={(e) => updateField('accountId', e.target.value)}
              onBlur={() => touchField('accountId')}
            />
          )}
        </FormField>

        <FormField
          label="JIRA DOMAIN"
          hint="Just the domain, no https:// e.g. myteam.atlassian.net"
          error={fieldErrors.jiraDomain}
        >
          {({ id }) => (
            <Input
              id={id}
              placeholder="yourcompany.atlassian.net"
              value={credentials.jiraDomain}
              onChange={(e) => updateField('jiraDomain', e.target.value)}
              onBlur={() => touchField('jiraDomain')}
            />
          )}
        </FormField>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <FormField label="JIRA EMAIL" error={fieldErrors.jiraEmail} noMargin>
              {({ id }) => (
                <Input
                  id={id}
                  placeholder="you@company.com"
                  value={credentials.jiraEmail}
                  onChange={(e) => updateField('jiraEmail', e.target.value)}
                  onBlur={() => touchField('jiraEmail')}
                />
              )}
            </FormField>
          </Col>
          <Col xs={24} md={12}>
            <FormField
              label="JIRA API TOKEN"
              hint="id.atlassian.com -> Security -> API tokens"
              error={fieldErrors.jiraToken}
              noMargin
            >
              {({ id }) => (
                <Input.Password
                  id={id}
                  placeholder="your-jira-api-token"
                  value={credentials.jiraToken}
                  onChange={(e) => updateField('jiraToken', e.target.value)}
                  onBlur={() => touchField('jiraToken')}
                />
              )}
            </FormField>
          </Col>
        </Row>
      </Card>

      <NoteBox>
        Credentials are saved in your browser's localStorage and auto-filled on next visit. Nothing
        is sent anywhere except directly to Groq, Jira, and Tempo APIs.
      </NoteBox>

      <StepActions>
        <Button variant="ghost" onClick={clearCredentials}>
          Clear Saved
        </Button>
        <Button variant="primary" disabled={!isComplete} onClick={onContinue}>
          Continue
        </Button>
      </StepActions>
    </div>
  );
}
