--
-- PostgreSQL database dump
--

\restrict pCguGNYn05GGfvzCXWNohtf63N1gqU5UsBUOBLsRY1PMgecAljUecXCjOBgPbuy

-- Dumped from database version 17.9
-- Dumped by pg_dump version 17.9

-- Started on 2026-11-05 20:50:41

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16623)
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    telefono character varying(50),
    email character varying(255),
    direccion character varying(255)
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16622)
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO postgres;

--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 221
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- TOC entry 224 (class 1259 OID 16634)
-- Name: historico_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historico_tickets (
    id integer NOT NULL,
    ticket_id integer,
    estado_anterior character varying(50),
    estado_nuevo character varying(50),
    fecha_cambio timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.historico_tickets OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16633)
-- Name: historico_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historico_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historico_tickets_id_seq OWNER TO postgres;

--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 223
-- Name: historico_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historico_tickets_id_seq OWNED BY public.historico_tickets.id;


--
-- TOC entry 226 (class 1259 OID 16642)
-- Name: reportes_tecnicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reportes_tecnicos (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    contador_paginas integer,
    nivel_toner character varying(50),
    repuestos_cambiados text,
    observaciones text,
    fecha_reporte timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reportes_tecnicos OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16641)
-- Name: reportes_tecnicos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reportes_tecnicos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reportes_tecnicos_id_seq OWNER TO postgres;

--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 225
-- Name: reportes_tecnicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reportes_tecnicos_id_seq OWNED BY public.reportes_tecnicos.id;


--
-- TOC entry 218 (class 1259 OID 16602)
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    cliente character varying(150) NOT NULL,
    asunto character varying(255) NOT NULL,
    estado character varying(50) DEFAULT 'Pendiente'::character varying,
    fecha date DEFAULT CURRENT_DATE,
    alerta_contactada boolean DEFAULT false NOT NULL,
    tipo_ticket character varying(50),
    fecha_alerta date,
    descripcion text
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16601)
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_id_seq OWNER TO postgres;

--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 217
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- TOC entry 220 (class 1259 OID 16611)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    rol character varying(50) DEFAULT 'tecnico'::character varying
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16610)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4768 (class 2604 OID 16626)
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- TOC entry 4769 (class 2604 OID 16637)
-- Name: historico_tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_tickets ALTER COLUMN id SET DEFAULT nextval('public.historico_tickets_id_seq'::regclass);


--
-- TOC entry 4771 (class 2604 OID 16645)
-- Name: reportes_tecnicos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_tecnicos ALTER COLUMN id SET DEFAULT nextval('public.reportes_tecnicos_id_seq'::regclass);


--
-- TOC entry 4762 (class 2604 OID 16605)
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- TOC entry 4766 (class 2604 OID 16614)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4937 (class 0 OID 16623)
-- Dependencies: 222
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id, nombre, telefono, email, direccion) FROM stdin;
1	Juan Pérez	+56 9 8765 4321	juan.perez@email.com	Av. Los Carrera 123, Quilpué
2	Gráficas SPA	+56 9 1122 3344	contacto@graficasspa.cl	Calle Condell 456, Valparaíso
3	Agencia de Publicidad X	+56 9 5566 7788	hola@agenciax.cl	1 Norte 789, Viña del Mar
4	Consultora Médica	+56 9 9988 7766	info@consultoramedica.cl	Av. Valparaíso 101, Viña del Mar
5	Carlos Mendoza	+56 9 4433 2211	cmendoza@email.com	Freire 202, Quilpué
6	Municipalidad Centro	+56 32 212 3456	contacto@municentro.cl	Plaza de Armas S/N, Centro
7	Universidad del Norte	+56 32 298 7654	admision@unorte.cl	Av. Brasil 303, Valparaíso
8	Librería Central	+56 9 6655 4433	ventas@libreriacentral.cl	Pedro Montt 404, Valparaíso
9	Colegio San Jorge	+56 32 256 7890	direccion@colegiosanjorge.cl	Los Leones 505, Quilpué
10	Estudio de Abogados Lex	+56 9 7788 9900	legal@estudiolex.cl	Arlegui 606, Viña del Mar
11	Constructora Beta	+56 9 2233 4455	proyectos@constructorabeta.cl	Camino Troncal 707, Villa Alemana
12	Notaría Pública 4	+56 32 234 5678	tramites@notaria4.cl	Blanco Encalada 808, Valparaíso
\.


--
-- TOC entry 4939 (class 0 OID 16634)
-- Dependencies: 224
-- Data for Name: historico_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historico_tickets (id, ticket_id, estado_anterior, estado_nuevo, fecha_cambio) FROM stdin;
\.


--
-- TOC entry 4941 (class 0 OID 16642)
-- Dependencies: 226
-- Data for Name: reportes_tecnicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reportes_tecnicos (id, ticket_id, contador_paginas, nivel_toner, repuestos_cambiados, observaciones, fecha_reporte) FROM stdin;
\.


--
-- TOC entry 4933 (class 0 OID 16602)
-- Dependencies: 218
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, cliente, asunto, estado, fecha, alerta_contactada, tipo_ticket, fecha_alerta, descripcion) FROM stdin;
1	Juan Pérez	HP LaserJet Pro M404dn	Pendiente	2026-11-01	f	Falla	\N	Atasco de papel constante en bandeja 2
2	Gráficas SPA	Epson EcoTank L8180	Reparado	2026-10-25	f	Falla	\N	Manchas de tinta en impresiones a color
3	Agencia de Publicidad X	Canon imageRUNNER ADVANCE	En Revisión	2026-11-02	f	Falla	\N	Código de error E000-0000 en pantalla
4	Consultora Médica	Brother HL-L3270CDW	Reparado	2026-05-15	f	Venta	\N	Venta de equipo nuevo con tóner extra
5	Carlos Mendoza	HP LaserJet MFP M234dwe	Reparado	2026-10-20	f	Falla	\N	No conecta a la red Wi-Fi
6	Municipalidad Centro	Kyocera ECOSYS M2640idw	En Revisión	2026-11-03	f	Falla	\N	Ruido fuerte al tomar las hojas del ADF
7	Universidad del Norte	Lexmark MB2236adw	Pendiente	2026-11-04	f	Falla	\N	Pantalla táctil no responde
8	Librería Central	Epson WorkForce Pro WF-C5790	Reparado	2026-06-10	f	Venta	\N	Instalación y configuración de equipo nuevo
9	Colegio San Jorge	HP Color LaserJet Pro M255dw	Pendiente	2026-10-30	f	Falla	\N	Colores desfasados al imprimir
10	Estudio de Abogados Lex	Brother MFC-L2710DW	En Revisión	2026-11-01	f	Falla	\N	Escáner produce líneas negras verticales
11	Constructora Beta	Ricoh IM 430F	Reparado	2026-10-15	f	Falla	\N	Fallo en la unidad de fusión
12	Notaría Pública 4	HP LaserJet Enterprise M507dn	Reparado	2026-07-05	f	Venta	\N	Venta de equipo de alto rendimiento
13	Juan Pérez	Brother DCP-L2540DW	En Revisión	2026-11-02	f	Falla	\N	No enciende, posible falla de fuente de poder
14	Gráficas SPA	Epson SureColor T3170	Pendiente	2026-10-28	f	Falla	\N	Cabezal obstruido, requiere limpieza profunda
15	Agencia de Publicidad X	HP DesignJet T650	Reparado	2026-07-20	f	Venta	\N	Plotter nuevo, incluye calibración
16	Consultora Médica	Xerox VersaLink C400	En Revisión	2026-11-04	f	Falla	\N	Pide reemplazo de tambor prematuramente
17	Carlos Mendoza	Canon PIXMA G6020	Pendiente	2026-11-05	f	Falla	\N	Imprime en blanco, no inyecta tinta
18	Municipalidad Centro	Kyocera TASKalfa 3554ci	Reparado	2026-10-10	f	Falla	\N	Bandeja 1 no reconoce el tamaño de papel cargado
19	Universidad del Norte	Lexmark CS431dw	En Revisión	2026-11-03	f	Falla	\N	Tóner magenta no es detectado por la impresora
20	Colegio San Jorge	Epson EcoTank L14150	Reparado	2026-08-01	f	Venta	\N	Equipo formato A3 para sala de profesores
\.


--
-- TOC entry 4935 (class 0 OID 16611)
-- Dependencies: 220
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, email, password, rol) FROM stdin;
2	dgstorechile@gmail.com	$2b$10$GrEBCh95hhSeM5a.KusNmuy8cm/B6eTGU1UImR72ZhULashtfkso2	admin
\.


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 221
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_id_seq', 12, true);


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 223
-- Name: historico_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historico_tickets_id_seq', 1, false);


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 225
-- Name: reportes_tecnicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reportes_tecnicos_id_seq', 1, false);


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 217
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_id_seq', 20, true);


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 2, true);


--
-- TOC entry 4780 (class 2606 OID 16632)
-- Name: clientes clientes_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_email_key UNIQUE (email);


--
-- TOC entry 4782 (class 2606 OID 16630)
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- TOC entry 4784 (class 2606 OID 16640)
-- Name: historico_tickets historico_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_tickets
    ADD CONSTRAINT historico_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 4786 (class 2606 OID 16650)
-- Name: reportes_tecnicos reportes_tecnicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes_tecnicos
    ADD CONSTRAINT reportes_tecnicos_pkey PRIMARY KEY (id);


--
-- TOC entry 4774 (class 2606 OID 16609)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 4776 (class 2606 OID 16621)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4778 (class 2606 OID 16619)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


-- Completed on 2026-11-05 20:50:42

--
-- PostgreSQL database dump complete
--

\unrestrict pCguGNYn05GGfvzCXWNohtf63N1gqU5UsBUOBLsRY1PMgecAljUecXCjOBgPbuy

