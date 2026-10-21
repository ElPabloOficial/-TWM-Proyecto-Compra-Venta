using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class hacer2
{
    public int id_servicio { get; set; }

    public int id_pregunta { get; set; }

    public string id_usuario { get; set; } = null!;

    public virtual pregunta id_preguntaNavigation { get; set; } = null!;

    public virtual servicio id_servicioNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;
}
