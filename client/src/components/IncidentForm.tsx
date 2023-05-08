import { useState, useRef, FormEventHandler } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-top: 0.5%;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Input = styled.input`
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  background-color: #eee;
  margin-right: 1rem;
  border: 0.5px solid black;

  @media screen and (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const TextArea = styled.textarea`
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  background-color: #eee;
  margin-top: 0.5rem;
  margin-right: 1rem;
  border: 0.5px solid black;

  @media screen and (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin-right: 10px;

  &:hover {
    cursor: pointer;
    opacity: 0.9;
  }

  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;

function IncidentForm() {
    const [photo, setPhoto] = useState<File | null>(null);
    const [lat, setLat] = useState<number>(0);
    const [lon, setLon] = useState<number>(0);
    const [title, setTitle] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const latInputRef = useRef<HTMLInputElement>(null);
    const lonInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const data = new FormData();
        if (photo !== null) {
            data.append('photo', photo);
        }
        data.append('lat', lat.toString());
        data.append('lon', lon.toString());
        data.append('title', title);

        axios.post('http://localhost:8000/', data, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then((response) => {
                console.log(response.data);
                if (fileInputRef.current !== null) {
                    fileInputRef.current.value = '';
                }

                if (latInputRef.current !== null) {
                    latInputRef.current.value = '';
                }

                if (lonInputRef.current !== null) {
                    lonInputRef.current.value = '';
                }

                setTitle('');
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <Form
            onSubmit={handleSubmit}
        >
            <Input
                type="file"
                onChange={(event) => setPhoto(event.target.files![0])}
                ref={fileInputRef}
            />
            <Input
                type="text"
                placeholder="Latitude"
                onChange={(event) => setLat(+event.target.value)}
                ref={latInputRef}
            />
            <Input
                type="text"
                placeholder="Longitude"
                onChange={(event) => setLon(+event.target.value)}
                ref={lonInputRef}
            />
            <TextArea
                placeholder="Title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
            >
            </TextArea>
            <Button type="submit">Submit</Button>
        </Form>
    );
}

export default IncidentForm;
