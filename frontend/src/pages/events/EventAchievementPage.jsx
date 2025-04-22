import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle } from 'lucide-react';
import { apiGet, apiPost } from '../../lib/api';

const EventAchievementPage = () => {
  const { eventIdAndCodes } = useParams();
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [error, setError] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [certificateBlob, setCertificateBlob] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateError, setCertificateError] = useState(null);

  useEffect(() => {
    if (!eventIdAndCodes) return;
    const [eventId, collegeCode, studentId] = eventIdAndCodes.split('+');
    if (!eventId || !collegeCode || !studentId) {
      setError('Invalid link.');
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await apiGet(`/api/events/${eventId}+${collegeCode}+${studentId}`);
        if (res.ok) {
          const data = await res.json();
          setEligible(data.eligible);
          setParticipant(data.participant);
          const eventRes = await apiGet(`/api/events/${eventId}`);
          if (eventRes.ok) {
            setEventDetails(await eventRes.json());
          }
        } else {
          setEligible(false);
        }
      } catch (err) {
        setError('Could not verify achievement.');
      } finally {
        setLoading(false);
      }
    })();
  }, [eventIdAndCodes]);

  useEffect(() => {
    if (eligible && participant && eventDetails && !certificateBlob && !certificateLoading) {
      setCertificateLoading(true);
      setCertificateError(null);
      apiPost(`/api/events/certificate/download`, {
        name: participant.name,
        workshop: eventDetails.name,
        instructor: eventDetails.instructor,
        event_date: eventDetails.event_date,
        college_code: participant.college_code,
        student_id: participant.student_id,
        event_id: participant.event_id
      })
        .then(async (res) => {
          if (res && res.ok) {
            const blob = await res.blob();
            setCertificateBlob(blob);
          } else {
            setCertificateError('Failed to generate certificate.');
          }
        })
        .catch(() => setCertificateError('Failed to generate certificate.'))
        .finally(() => setCertificateLoading(false));
    }
  }, [eligible, participant, eventDetails, certificateBlob, certificateLoading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="max-w-xl w-full py-12">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="max-w-xl w-full py-12">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="max-w-xl w-full py-12">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Not Eligible</CardTitle>
              <CardDescription>
                Sorry, you are not eligible for this achievement. If you think that this is a mistake, feel free to reach out to our support team.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="max-w-xl w-full py-8 sm:py-12">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-lg sm:text-2xl">Congratulations!</CardTitle>
            <CardDescription className="text-base sm:text-lg">
              You have successfully accomplished this achievement.<br />
              Well done, {participant?.name || 'Participant'}!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-2 text-sm sm:text-base">
              <div><strong>Event ID:</strong> {participant?.event_id}</div>
              <div><strong>College Code:</strong> {participant?.college_code}</div>
              <div><strong>Student ID:</strong> {participant?.student_id}</div>
              {eventDetails?.instructor && (
                <div><strong>Instructor:</strong> {eventDetails.instructor}</div>
              )}
            </div>
            <div className="mt-8">
              <Button
                className="w-full sm:w-auto"
                disabled={downloading || certificateLoading || !certificateBlob}
                onClick={async () => {
                  if (!certificateBlob || !participant) return;
                  setDownloading(true);
                  try {
                    const url = window.URL.createObjectURL(certificateBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${participant.name}_certificate.png`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } finally {
                    setDownloading(false);
                  }
                }}
              >
                {certificateLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-background inline-block align-middle" />
                    Generating...
                  </>
                ) : downloading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-background inline-block align-middle" />
                    Downloading...
                  </>
                ) : (
                  'Download'
                )}
              </Button>
              {certificateError && (
                <div className="text-red-500 text-sm mt-2">{certificateError}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventAchievementPage;
