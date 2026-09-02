import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { EnquiryForm } from '@/components/blocks/EnquiryForm';

/**
 * Enquiry form behaviour.
 *
 * Covers the paths that matter for a form collecting sensitive personal data:
 * that it refuses to submit without consent, that errors are announced and
 * associated with their fields, and that a failing request does not silently
 * present itself as a success.
 */

const fetchMock = vi.fn();

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/full name/i), 'Amina Yusuf');
  await user.type(screen.getByLabelText(/email address/i), 'amina@example.com');
  await user.type(screen.getByLabelText(/telephone/i), '07417 487423');
  await user.type(screen.getByLabelText(/country of residence/i), 'Nigeria');
  await user.type(screen.getByLabelText(/nationality/i), 'Nigerian');
  await user.selectOptions(screen.getByLabelText(/type of enquiry/i), 'Spouse or partner visa');
  await user.type(
    screen.getByLabelText(/brief description/i),
    'My husband is a British citizen and I would like to apply to join him in the UK.',
  );
  await user.selectOptions(screen.getByLabelText(/preferred method of contact/i), 'Email');
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('EnquiryForm', () => {
  it('renders every field required by the specification', () => {
    render(<EnquiryForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telephone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country of residence/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nationality/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type of enquiry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/brief description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred method of contact/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consent to my details/i)).toBeInTheDocument();
  });

  it('does not submit when fields are empty', async () => {
    const user = userEvent.setup();
    render(<EnquiryForm />);

    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(await screen.findByText(/please correct the highlighted fields/i)).toBeInTheDocument();
  });

  it('refuses to submit without the consent checkbox', async () => {
    const user = userEvent.setup();
    render(<EnquiryForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(await screen.findByText(/confirm you have read/i)).toBeInTheDocument();
  });

  it('associates each error with its field for assistive technology', async () => {
    const user = userEvent.setup();
    render(<EnquiryForm />);

    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    const nameField = await screen.findByLabelText(/full name/i);
    await waitFor(() => expect(nameField).toHaveAttribute('aria-invalid', 'true'));
    expect(nameField).toHaveAttribute('aria-describedby');
  });

  it('clears a field error as soon as the visitor corrects it', async () => {
    const user = userEvent.setup();
    render(<EnquiryForm />);

    await user.click(screen.getByRole('button', { name: /send enquiry/i }));
    const nameField = await screen.findByLabelText(/full name/i);
    await waitFor(() => expect(nameField).toHaveAttribute('aria-invalid', 'true'));

    await user.type(nameField, 'Amina Yusuf');
    await waitFor(() => expect(nameField).not.toHaveAttribute('aria-invalid'));
  });

  it('submits a complete form and shows the acknowledgement', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Your details have been checked and received.' }),
    });

    const user = userEvent.setup();
    render(<EnquiryForm />);

    await fillValidForm(user);
    await user.click(screen.getByLabelText(/consent to my details/i));
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(await screen.findByTestId('enquiry-success')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/enquiry', expect.objectContaining({ method: 'POST' }));
  });

  it('surfaces a server rejection rather than claiming success', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Please correct the highlighted fields and try again.' }),
    });

    const user = userEvent.setup();
    render(<EnquiryForm />);

    await fillValidForm(user);
    await user.click(screen.getByLabelText(/consent to my details/i));
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(await screen.findByText(/please correct the highlighted fields/i)).toBeInTheDocument();
    expect(screen.queryByTestId('enquiry-success')).not.toBeInTheDocument();
  });

  it('surfaces a network failure rather than failing silently', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));

    const user = userEvent.setup();
    render(<EnquiryForm />);

    await fillValidForm(user);
    await user.click(screen.getByLabelText(/consent to my details/i));
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(await screen.findByText(/could not reach the server/i)).toBeInTheDocument();
    expect(screen.queryByTestId('enquiry-success')).not.toBeInTheDocument();
  });

  it('renders no reCAPTCHA widget when no site key is configured', () => {
    render(<EnquiryForm />);
    expect(screen.queryByTestId('recaptcha-widget')).not.toBeInTheDocument();
  });

  it('renders the reCAPTCHA widget once a site key is configured', () => {
    render(<EnquiryForm recaptchaSiteKey="test-site-key" />);
    expect(screen.getByTestId('recaptcha-widget')).toBeInTheDocument();
  });

  it('refuses to submit without completing reCAPTCHA when it is configured', async () => {
    const user = userEvent.setup();
    render(<EnquiryForm recaptchaSiteKey="test-site-key" />);

    await fillValidForm(user);
    await user.click(screen.getByLabelText(/consent to my details/i));
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(await screen.findByText(/confirm you are not a robot/i)).toBeInTheDocument();
  });

  it('hides the honeypot from assistive technology', () => {
    render(<EnquiryForm />);
    const honeypot = document.querySelector('input[name="website"]');

    expect(honeypot).not.toBeNull();
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(honeypot).toHaveAttribute('tabIndex', '-1');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<EnquiryForm />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
