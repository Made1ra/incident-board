import { useState, useEffect } from 'react';
import axios from 'axios';
import MapWidget from './MapWidget';
import styled from 'styled-components';

const Header = styled.h1`
    text-align: center;
`;

const List = styled.ul`
    list-style: none;
`;

const ListItem = styled.li`
    margin-bottom: 1%;

    border: 0.5px solid black;
    border-radius: 1rem;

    width: 40%;

    position: relative;
    left: 50%;
    transform: translateX(-50%);

    @media only screen and (max-width: 768px) {
        width: 80%;
    }
`;

const EditArea = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Input = styled.input`
    font-size: 1.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: #eee;
    margin-right: 1rem;
    margin-top: 1rem;

    text-align: center;

    border: 0.5px solid black;
`;

const Content = styled.div`
    display: flex;
    justify-content: center;

    margin-top: 2rem;
    margin-bottom: 2.5%;
`;

const Title = styled.h3`
    text-align: center;

    margin-left: -40px;
`;

const Image = styled.img`
    margin-right: 10px;
    border-radius: 7.5%;
`;

const SubmitButton = styled.button`
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 10px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin-right: 1rem;
    margin-top: 1rem;

    &:hover {
        cursor: pointer;
        opacity: 0.9;
    }
`;

const EditButton = styled.button`
    position: absolute;
    top: 0;
    right: 0;

    margin-top: 3%;
    margin-right: 9.5%;

    width: 50px;
    height: 30px;

    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 10%;
    font-size: 16px;
    cursor: pointer;

    text-align: center;

    &:hover {
        background-color: #0069d9;
    }
`;

const RemoveButton = styled.button`
    position: absolute;
    top: 0;
    right: 0;

    margin-top: 3%;
    margin-right: 4%;

    width: 30px;
    height: 30px;

    background-color: #f44336;
    color: #fff;
    border: none;
    border-radius: 25%;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #d32f2f;
    }

    &:focus {
        outline: none;
    }
`;

type Incident = {
    id: string;
    imagePath: string;
    imageTitle: string;
    lat: number;
    lon: number;
    title: string;
}

function IncidentList() {
    const [incidents, setIncidents] = useState<Array<Incident>>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [editedIncidentId, setEditedIncidentId] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8000/')
            .then((response) => {
                setIncidents(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [incidents, setIncidents]);

    async function editTitle(id: string) {
        try {
            if (title.trim() !== '') {
                await axios.put(`http://localhost:8000/${id}`, { title: title });
            }
        } catch (error) {
            console.error(error);
        }

        if (title.trim() !== '') {
            setIncidents(incidents.map((incident: Incident) => {
                if (incident.id === id) {
                    return {
                        ...incident,
                        title: title
                    };
                } else {
                    return incident;
                }
            }));
        }

        setIsEditing(false);
        setEditedIncidentId('');
        setTitle('');
    }

    async function removeIncident(id: string) {
        try {
            await axios.delete(`http://localhost:8000/${id}`);
            setIncidents(incidents.filter((incident) => incident.id !== id));
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <Header>Incidents</Header>
            <List>
                {incidents.map((incident) => (
                    <ListItem key={incident.id}>
                        {(isEditing && editedIncidentId === incident.id) ?
                            <EditArea>
                                <Input
                                    type="text"
                                    hidden={!isEditing}
                                    defaultValue={incident.title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    onKeyDown={(event) => event.key === 'Enter' && editTitle(incident.id)}
                                />
                                <SubmitButton
                                    type="submit"
                                    hidden={!isEditing}
                                    onClick={() => editTitle(incident.id)}
                                >
                                    Submit
                                </SubmitButton>
                            </EditArea> :
                            <Title>{incident.title}</Title>}
                        <Content>
                            <Image
                                src={incident.imagePath}
                                alt={incident.imageTitle}
                                width="200"
                                height="200"
                            />
                            <MapWidget
                                lon={incident.lon}
                                lat={incident.lat}
                            />
                            <EditButton onClick={() => {
                                setIsEditing(true);
                                setEditedIncidentId(incident.id);
                            }}>Edit</EditButton>
                            <RemoveButton onClick={() => removeIncident(incident.id)}>X</RemoveButton>
                        </Content>
                    </ListItem>
                ))
                }
            </List >
        </div >
    )
}

export default IncidentList;
