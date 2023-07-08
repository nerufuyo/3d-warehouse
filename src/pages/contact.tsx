import axios from 'axios';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import ReactLoading from 'react-loading';

import Hero from 'components/Hero';

import { APIResponse } from 'types/apiResponse';

export default function PageContact() {
  const router = useRouter();

  const [input, setInput] = useState<{
    name: string;
    email: string;
    subject: 'feedback' | 'report' | 'request' | 'others';
    message: string;
  }>({
    name: '',
    email: '',
    subject: 'feedback',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetHandler = () => {
    setInput({
      name: '',
      email: '',
      subject: 'feedback',
      message: '',
    });
    setIsSubmitted(false);
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage('');
    setIsLoading(false);
  };
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setIsSubmitted(false);
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage('');

    try {
      const inquiryCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('inquiry='));
      if (!inquiryCookie) {
        const cookieExpire = new Date(
          Date.now() + 12 * 60 * 60 * 1000,
        ).toUTCString();
        document.cookie = `inquiry=0; path=/; expires=${cookieExpire}; httponly; SameSite=Strict`;
      }

      const res = await axios.post<APIResponse>('/api/inquiry', {
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
      });

      if (res.status !== 201)
        throw new Error(res.data?.error?.message || 'Unknown error');

      setInput({
        name: '',
        email: '',
        subject: 'feedback',
        message: '',
      });
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.message);
      if (error.response.data.error) {
        setErrorMessage(error.response.data.error.message);
      }
      setIsError(true);
    } finally {
      setIsSubmitted(true);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Hero
        key={`hero-${router.asPath}`}
        image={'/img/hero/4.webp'}
        title={'Contact us'}
      />

      <div className='w-full mx-auto max-w-screen-lg flex flex-col relative gap-4 px-4 md:px-8 -top-8'>
        <div className='w-full h-auto flex-1 grid place-items-center rounded-xl'>
          <span className='text-2xl whitespace-nowrap'>Send us a message</span>
        </div>
        <form
          className='w-full flex-1 h-full flex flex-col justify-center items-center gap-4'
          onReset={resetHandler}
          onSubmit={submitHandler}
        >
          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor='name'>Name</label>
            <input
              id='name'
              name='name'
              type='text'
              disabled={isLoading}
              placeholder='Input your name or handle name'
              required
              value={input.name}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              name='email'
              type='email'
              disabled={isLoading}
              placeholder='We will reply to this email'
              required
              value={input.email}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor='subject'>Subject</label>
            <select
              value={input.subject}
              disabled={isLoading}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  subject: e.target.value as any,
                }))
              }
            >
              <option value='feedback'>Feedback</option>
              <option value='report'>Report</option>
              <option value='request'>Request</option>
              <option value='other'>Other</option>
            </select>
          </div>
          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor='message'>Message</label>
            <textarea
              id='message'
              name='message'
              placeholder='Input your message here'
              required
              disabled={isLoading}
              rows={5}
              value={input.message}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, message: e.target.value }))
              }
            />
          </div>
          <div className='w-full flex items-center justify-end gap-2'>
            <button
              type='reset'
              disabled={isLoading}
            >
              Reset
            </button>
            <button
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={'flex items-center gap-2'}>
                  <ReactLoading
                    type={'spin'}
                    width={18}
                    height={18}
                  />{' '}
                  Sending...
                </span>
              ) : (
                'Send message'
              )}
            </button>
          </div>
        </form>
        <div
          className={`grid ${
            isSubmitted ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          } transition-all overflow-hidden`}
        >
          <div
            className={`w-full min-h-0 rounded-lg bg-blue-600 px-4 ${
              isSubmitted ? 'py-2' : 'py-0'
            } ${isSuccess ? 'bg-blue-600' : ''} ${
              isError ? 'bg-red-600' : ''
            } transition-all`}
          >
            {isSuccess
              ? 'Thank you for your message. We will reply to your email as soon as possible.'
              : isError
              ? errorMessage
              : 'Failed to send message. Please try again later.'}
          </div>
        </div>
      </div>
    </>
  );
}
